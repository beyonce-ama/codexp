<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

use App\Models\MatchModel;
use App\Models\MatchParticipant;
use App\Models\MatchSearch;
use App\Events\MatchAttempt;
use App\Services\MatchService;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class MatchRuntimeController extends Controller
{
    public function show(Request $request, string $slug)
    {
        $me = $request->user()->id;

        $match = MatchModel::with('participants')->where('public_id', $slug)->firstOrFail();

        if (!$match->participants->pluck('user_id')->contains($me)) {
            abort(403, 'Not your match');
        }

        if (Schema::hasColumn('match_participants', 'join_secret')) {
            $expected = MatchParticipant::where('match_id', $match->id)
                ->where('user_id', $me)
                ->value('join_secret');

            // enforce only if token exists for this participant
            if ($expected !== null && $expected !== '') {
                $provided = (string) $request->query('t', '');
                if ($provided === '' || !hash_equals($expected, $provided)) {
                    abort(403, 'Invalid or missing token');
                }
            }
        }

        // Challenge may be flat or { challenge: {...} }
        $raw = json_decode($match->challenge_json ?? 'null', true) ?: [];
        $challenge = is_array($raw['challenge'] ?? null) ? $raw['challenge'] : $raw;

        return \Inertia\Inertia::render('Participant/MatchStart', [
            'match' => [
                'id'         => $match->id,          // <-- numeric for API routes
                'slug'       => $match->public_id,   // <-- used only in the page URL
                'language'   => $match->language,
                'difficulty' => $match->difficulty,
                'mode'       => 'aigenerated',
                'me'         => $me,
                'opponent'   => $match->participants->firstWhere('user_id', '<>', $me)?->user_id,
            ],
            'challenge' => $challenge,
            'ui'        => ['showOpponentAsAnimation' => true],
        ]);
    }

    protected function durationSecondsFor(string $difficulty): int
    {
        $d = strtolower($difficulty);
        if ($d === 'hard') return 20 * 60;
        if ($d === 'medium') return 15 * 60;
        return 10 * 60; // easy / default
    }

    protected function checkTimeOrFinish($match)
    {
        // assume $match has: started_at (datetime), difficulty, finished_at, winner_user_id, reason/message fields if you use them
        if ($match->finished_at) {
            return; // already finished
        }

        $startedAt = $match->started_at ?? $match->created_at;
        if (!$startedAt) return;

        $dur = $this->durationSecondsFor($match->difficulty ?? 'easy');
        $endsAt = \Carbon\Carbon::parse($startedAt)->addSeconds($dur);
        if (now()->greaterThanOrEqualTo($endsAt)) {
            // finalize as timeout, NO WINNER, NO REWARDS
            $match->finished_at = now();
            $match->winner_user_id = null;// if you have this column
            $match->save();
        }
    }

    /**
     * POST /api/match/{match}/submit
     * Body: { code: string }
     */
    public function submit(Request $r, MatchModel $match, MatchService $svc)
    {
        $userId = $r->user()->id;

        // Must be a participant
        $isMine = MatchParticipant::where('match_id', $match->id)->where('user_id', $userId)->exists();
        abort_unless($isMine, 403);

        $data = $r->validate(['code' => 'required|string']);

        // Ensure challenge exists
        $raw = json_decode($match->challenge_json ?? 'null', true);
        if (!$raw) {
            Log::warning('Challenge JSON missing/invalid.', ['match_id' => $match->id]);
            return response()->json([
                'correct' => false,
                'message' => 'Challenge is not ready yet. Please retry in a few seconds.',
            ], 422);
        }
        $this->checkTimeOrFinish($match);
        if ($match->finished_at) {
            return response()->json([
                'correct' => false,
                'message' => 'Time is up. Match already ended with no rewards.'
            ], 409);
        }

        try {
            // Judge & finish atomically in the service (handles row locks / winner)
            // The service now handles saving to match_submissions internally
            $result = $svc->submitCode(matchId: (int)$match->id, userId: (int)$userId, code: (string)$data['code']);
            $correct = (bool)($result['is_correct'] ?? false);
            $msg = $correct ? 'Correct!' : 'Wrong — keep trying.';

            \Log::debug('Submit result:', [
                'match_id' => $match->id,
                'user_id' => $userId,
                'correct' => $correct,
                'result' => $result
            ]);

            // Cache last attempt for polling fallback - THIS IS WHAT THE OTHER USER SEES
            Cache::put("match:{$match->id}:last_attempt", [
                'user_id' => $userId,
                'correct' => $correct,
                'message' => $msg,
                'at'      => now()->toIso8601String(),
            ], now()->addMinutes(10));

            if (!$correct) {
                return response()->json(['correct' => false, 'message' => 'Wrong — keep trying.']);
            }

            $fresh = MatchModel::find($match->id);
            return response()->json([
                'correct'  => true,
                'message'  => 'You win!',
                'finished' => $fresh?->status === 'finished',
            ]);

        } catch (\Throwable $e) {
            Log::error('Match submit failed', [
                'match_id' => $match->id,
                'user_id'  => $userId,
                'msg'      => $e->getMessage(),
                'file'     => $e->getFile(),
                'line'     => $e->getLine(),
            ]);
            return response()->json([
                'correct' => false,
                'message' => 'Server error while judging submission.',
            ], 500);
        }
    }

    /**
     * POST /api/match/{match}/finalize  (optional safety)
     */
    public function finalize(Request $r, int $match)
    {
        MatchModel::where('id', $match)->update([
            'status'      => 'finished',
            'finished_at' => now(),
        ]);

        $userIds = MatchParticipant::where('match_id', $match)->pluck('user_id');
        MatchSearch::whereIn('user_id', $userIds)->where('status', 'searching')->update(['status' => 'cancelled']);

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/match/{match}/leave → same as surrender
     */
    public function leave(Request $r, MatchModel $match, MatchService $svc)
    {
        return $this->surrender($r, $match, $svc);
    }

    /**
     * GET /api/match/{match}/status
     */
    public function status(Request $r, MatchModel $match)
    {
        $userId = $r->user()->id;
        $isMine = MatchParticipant::where('match_id', $match->id)->where('user_id', $userId)->exists();
        abort_unless($isMine, 403);

        $last = Cache::get("match:{$match->id}:last_attempt");

        // Build opponent payload (id, name, avatar_url)
        $participantIds = MatchParticipant::where('match_id', $match->id)->pluck('user_id')->all();
        $oppId = null;
        foreach ($participantIds as $pid) {
            if ((int)$pid !== (int)$userId) { $oppId = (int)$pid; break; }
        }

        $opponentPayload = null;
        if ($oppId) {
            $opp = User::find($oppId);
            if ($opp) {
                $opponentPayload = [
                    'id'         => (int) $opp->id,
                    'name'       => (string) ($opp->name ?? 'Opponent'),
                    'avatar_url' => $opp->avatar_url, // accessor from your User model
                ];
            }
        }

        // Recent submissions
        $recentSubmissions = DB::table('match_submissions')
            ->select('id', 'user_id', 'is_correct', 'created_at')
            ->where('match_id', $match->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($submission) use ($userId) {
                $createdAt = $submission->created_at
                    ? \Illuminate\Support\Carbon::parse($submission->created_at)->toIso8601String()
                    : now()->toIso8601String();

                return [
                    'id'         => (string) $submission->id,
                    'user_id'    => (int) $submission->user_id,
                    'is_correct' => (int) $submission->is_correct, // keep 0/1 (client normalizes)
                    'at'         => $createdAt,
                    'by_me'      => ((int) $submission->user_id === (int) $userId),
                ];
            })
            ->values();

        // Ensure timeout autocloses if time elapsed
        $this->checkTimeOrFinish($match);

        // Compute ends_at for client
        $startedAt = $match->started_at ?? $match->created_at;
        $dur       = $this->durationSecondsFor($match->difficulty ?? 'easy');
        $endsAt    = $startedAt ? \Carbon\Carbon::parse($startedAt)->addSeconds($dur) : null;

        $remaining = null;
        if ($endsAt) {
            $remaining = max(0, $endsAt->diffInSeconds(now(), false) * -1);
        }

        // Timer payload for the frontend
        $payload = [
            'server_now'        => now()->toIso8601String(),
            'ends_at'           => $endsAt ? $endsAt->toIso8601String() : null,
            'remaining_seconds' => $remaining,
            'finished'          => (bool) $match->finished_at, // treat timeout as finished
            'winner_user_id'    => $match->winner_user_id,
        ];

        // Derive a "timeout" last message if none is cached but match finished by timeout
        if (empty($last) && $match->finished_at && empty($match->winner_user_id)) {
            $last = [
                'user_id' => null,
                'correct' => false,
                'message' => 'timeout',
                'at'      => optional($match->finished_at)->toIso8601String() ?? now()->toIso8601String(),
            ];
        }

        return response()->json(array_merge([
            'status'         => $match->status,
            'winner_user_id' => $match->winner_user_id ?? null,
            'finished'       => (bool) $match->finished_at, // consistent with payload
            'last'           => $last,
            'submissions'    => $recentSubmissions,
            'opponent'       => $opponentPayload, // <-- added
        ], $payload));
    }

    /**
     * POST /api/match/{match}/surrender
     */
    public function surrender(Request $r, MatchModel $match, MatchService $svc)
    {
        $userId = $r->user()->id;

        $isMine = MatchParticipant::where('match_id', $match->id)->where('user_id', $userId)->exists();
        abort_unless($isMine, 403);

        // Finish + reward atomically in the service
        $svc->surrender(matchId: (int)$match->id, userId: (int)$userId);

        // Cache + broadcast "Surrendered"
        Cache::put("match:{$match->id}:last_attempt", [
            'user_id' => $userId,
            'correct' => false,
            'message' => 'Surrendered',
            'at'      => now()->toIso8601String(),
        ], now()->addMinutes(10));

        return response()->json(['ok' => true]);
    }

    public function award(Request $r, int $match)
    {
        return DB::transaction(function () use ($match) {
            /** @var \App\Models\MatchModel $m */
            $m = MatchModel::lockForUpdate()->findOrFail($match);

            // must be finished
            if ($m->status !== 'finished' || empty($m->winner_user_id)) {
                return response()->json(['ok' => false, 'reason' => 'not_finished'], 409);
            }

            // idempotency via matches.payload->awarded
            $meta = is_array($m->payload ?? null) ? $m->payload : [];
            if (!empty($meta['awarded'])) {
                return response()->json(['ok' => true, 'already' => true]);
            }

            // figure winner/loser
            $p = DB::table('match_participants')->where('match_id', $m->id)->pluck('user_id')->all();
            $winnerId = (int) $m->winner_user_id;
            $loserId  = (int) collect($p)->first(fn ($id) => (int)$id !== $winnerId);

            // XP by difficulty
            $xpMap = ['easy' => 3, 'medium' => 4, 'hard' => 6];
            $xp    = $xpMap[strtolower((string)$m->difficulty)] ?? 3;

            // users: winner +xp, +1 star; loser -1 star (not below 0)
            DB::table('users')->where('id', $winnerId)->update([
                'total_xp' => DB::raw('COALESCE(total_xp,0) + '.$xp),
                'stars'    => DB::raw('GREATEST(COALESCE(stars,0) + 1, 0)'),
                'updated_at' => now(),
            ]);

            if ($loserId) {
                DB::table('users')->where('id', $loserId)->update([
                    'stars' => DB::raw('GREATEST(COALESCE(stars,0) - 1, 0)'),
                    'updated_at' => now(),
                ]);
            }

            // user_language_stats for both players (upsert + recalc winrate)
            $updateStats = function (int $userId, bool $won) use ($m) {
                $row = DB::table('user_language_stats')
                    ->lockForUpdate()
                    ->where('user_id', $userId)
                    ->where('language', $m->language)
                    ->first();

                $games  = (int)($row->games_played ?? 0) + 1;
                $wins   = (int)($row->wins ?? 0) + ($won ? 1 : 0);
                $losses = (int)($row->losses ?? 0) + ($won ? 0 : 1);
                $winrate = $games > 0 ? round(($wins / $games) * 100, 3) : 0.0;

                if ($row) {
                    DB::table('user_language_stats')
                        ->where('id', $row->id)
                        ->update([
                            'games_played' => $games,
                            'wins'         => $wins,
                            'losses'       => $losses,
                            'winrate'      => $winrate,
                            'updated_at'   => now(),
                        ]);
                } else {
                    DB::table('user_language_stats')->insert([
                        'user_id'      => $userId,
                        'language'     => $m->language,
                        'games_played' => $games,
                        'wins'         => $wins,
                        'losses'       => $losses,
                        'winrate'      => $winrate,
                        'created_at'   => now(),
                        'updated_at'   => now(),
                    ]);
                }
            };

            $updateStats($winnerId, true);
            if ($loserId) $updateStats($loserId, false);

            // mark awarded
            $meta['awarded'] = true;
            $m->payload = $meta;
            $m->save();

            return response()->json(['ok' => true, 'xp' => $xp]);
        });
    }
}
