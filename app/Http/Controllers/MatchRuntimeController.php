<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

use App\Models\MatchModel;
use App\Models\MatchParticipant;
use App\Models\MatchSearch;
use App\Services\MatchService;
use App\Models\User;

// Reuse the same table you used for invite duels
use App\Models\DuelTaken;
// For achievements after live matches
use App\Services\AchievementService;

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

            if ($expected !== null && $expected !== '') {
                $provided = (string) $request->query('t', '');
                if ($provided === '' || !hash_equals($expected, $provided)) {
                    abort(403, 'Invalid or missing token');
                }
            }
        }

        // Ensure “started” rows exist in duels_taken for live
        $this->markLiveStartedRows($match);

        // Challenge may be flat or { challenge: {...} }
        $raw = json_decode($match->challenge_json ?? 'null', true) ?: [];
        $challenge = is_array($raw['challenge'] ?? null) ? $raw['challenge'] : $raw;

        return \Inertia\Inertia::render('Participant/MatchStart', [
            'match' => [
                'id'         => $match->id,
                'slug'       => $match->public_id,
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
        if ($match->finished_at) return;

        $startedAt = $match->started_at ?? $match->created_at;
        if (!$startedAt) return;

        $dur = $this->durationSecondsFor($match->difficulty ?? 'easy');
        $endsAt = \Carbon\Carbon::parse($startedAt)->addSeconds($dur);
        if (now()->greaterThanOrEqualTo($endsAt)) {
            // Time-out: finished, no winner, no rewards
            $match->finished_at = now();
            $match->winner_user_id = null;
            $match->status = 'finished';
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

        $isMine = MatchParticipant::where('match_id', $match->id)->where('user_id', $userId)->exists();
        abort_unless($isMine, 403);

        $data = $r->validate(['code' => 'required|string']);

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
            // Judge & finish atomically in service (sets winner + finished_at)
            $result  = $svc->submitCode(matchId: (int)$match->id, userId: (int)$userId, code: (string)$data['code']);
            $correct = (bool)($result['is_correct'] ?? false);
            $msg     = $correct ? 'Correct!' : 'Wrong — keep trying.';

            \Log::debug('Submit result:', [
                'match_id' => $match->id,
                'user_id'  => $userId,
                'correct'  => $correct,
                'result'   => $result
            ]);

            Cache::put("match:{$match->id}:last_attempt", [
                'user_id' => $userId,
                'correct' => $correct,
                'message' => $msg,
                'at'      => now()->toIso8601String(),
            ], now()->addMinutes(10));

            if (!$correct) {
                return response()->json(['correct' => false, 'message' => 'Wrong — keep trying.']);
            }

            // Auto-award as soon as the match is finished with a winner
            $fresh = MatchModel::find($match->id);
            if ($fresh?->status === 'finished' && $fresh?->winner_user_id) {
                $this->awardInternal((int)$fresh->id); // writes is_winner/xp_earned/stars_earned
            }

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
     * POST /api/match/{match}/finalize (optional safety)
     */
    public function finalize(Request $r, int $match)
    {
        MatchModel::where('id', $match)->update([
            'status'      => 'finished',
            'finished_at' => now(),
        ]);

        // If there is already a winner, award now
        $m = MatchModel::find($match);
        if ($m && $m->winner_user_id) {
            $this->awardInternal((int)$m->id);
        }

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

        // Opponent payload
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
                    'avatar_url' => $opp->avatar_url,
                ];
            }
        }

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
                    'is_correct' => (int) $submission->is_correct,
                    'at'         => $createdAt,
                    'by_me'      => ((int) $submission->user_id === (int) $userId),
                ];
            })
            ->values();

        $this->checkTimeOrFinish($match);

        $startedAt = $match->started_at ?? $match->created_at;
        $dur       = $this->durationSecondsFor($match->difficulty ?? 'easy');
        $endsAt    = $startedAt ? \Carbon\Carbon::parse($startedAt)->addSeconds($dur) : null;

        $remaining = null;
        if ($endsAt) {
            $remaining = max(0, $endsAt->diffInSeconds(now(), false) * -1);
        }

        $payload = [
            'server_now'        => now()->toIso8601String(),
            'ends_at'           => $endsAt ? $endsAt->toIso8601String() : null,
            'remaining_seconds' => $remaining,
            'finished'          => (bool) $match->finished_at,
            'winner_user_id'    => $match->winner_user_id,
        ];

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
            'finished'       => (bool) $match->finished_at,
            'last'           => $last,
            'submissions'    => $recentSubmissions,
            'opponent'       => $opponentPayload,
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

        // Finish + set winner in service
        $svc->surrender(matchId: (int)$match->id, userId: (int)$userId);

        // Auto-award now that we have a winner
        $this->awardInternal((int)$match->id);

        // Cache message
        Cache::put("match:{$match->id}:last_attempt", [
            'user_id' => $userId,
            'correct' => false,
            'message' => 'Surrendered',
            'at'      => now()->toIso8601String(),
        ], now()->addMinutes(10));

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/match/{match}/award
     * Idempotent: uses matches.payload->awarded
     */
    public function award(Request $r, int $match)
    {
        $result = $this->awardInternal($match);
        return response()->json($result);
    }

    /* -------------------- Internals -------------------- */

    /**
     * The shared, idempotent award logic used by submit/surrender/finalize/award.
     * Returns an array payload suitable for JSON.
     */
    private function awardInternal(int $match): array
    {
        return DB::transaction(function () use ($match) {
            /** @var \App\Models\MatchModel $m */
            $m = MatchModel::lockForUpdate()->findOrFail($match);

            if ($m->status !== 'finished' || empty($m->winner_user_id)) {
                return ['ok' => false, 'reason' => 'not_finished'];
            }

            $meta = is_array($m->payload ?? null) ? $m->payload : [];
            if (!empty($meta['awarded'])) {
                return ['ok' => true, 'already' => true];
            }

            // Participants
            $p = DB::table('match_participants')->where('match_id', $m->id)->pluck('user_id')->all();
            $winnerId = (int) $m->winner_user_id;
            $loserId  = (int) collect($p)->first(fn ($id) => (int)$id !== $winnerId);

            // XP by difficulty
            $xpMap = ['easy' => 3, 'medium' => 4, 'hard' => 6];
            $xp    = (int) ($xpMap[strtolower((string)$m->difficulty)] ?? 3);
            $winnerStars = 1;

            // format XP as decimal (e.g., 3.00) to play nice with DECIMAL(10,2)
                $xpDec = number_format($xp, 2, '.', '');

                // Winner: lifetime + seasonal
                DB::table('users')->where('id', $winnerId)->update([
                    // lifetime
                    'total_xp'     => DB::raw('COALESCE(total_xp,0) + '.$xpDec),
                    'stars'        => DB::raw('GREATEST(COALESCE(stars,0) + 1, 0)'),
                    // seasonal
                    'season_xp'    => DB::raw('COALESCE(season_xp,0) + '.$xpDec),
                    'season_stars' => DB::raw('GREATEST(COALESCE(season_stars,0) + 1, 0)'),
                    'updated_at'   => now(),
                ]);

                // Loser: lifetime + seasonal star penalty
                if ($loserId) {
                    DB::table('users')->where('id', $loserId)->update([
                        'stars'        => DB::raw('GREATEST(COALESCE(stars,0) - 1, 0)'),
                        'season_stars' => DB::raw('GREATEST(COALESCE(season_stars,0) - 1, 0)'),
                        'updated_at'   => now(),
                    ]);
                }


            // user_language_stats (upsert + winrate)
            $this->updateLanguageStats($winnerId, $m->language, true);
            if ($loserId) $this->updateLanguageStats($loserId, $m->language, false);

            // duels_taken rows for LIVE — this sets is_winner/xp_earned/stars_earned
            $this->markLiveFinishedRows($m, $winnerId, $loserId, $xp, $winnerStars);

            // Mark awarded for idempotency
            $meta['awarded'] = true;
            $m->payload = $meta;
            $m->save();

            // PVP achievements (invite + live combined)
            $this->checkPvpAchievementsFor($winnerId);
            if ($loserId) $this->checkPvpAchievementsFor($loserId);

            return ['ok' => true, 'xp' => $xp];
        });
    }

    private function markLiveStartedRows(MatchModel $m): void
    {
        $uids = MatchParticipant::where('match_id', $m->id)->pluck('user_id')->all();
        foreach ($uids as $uid) {
            if (!$uid) continue;
            DuelTaken::firstOrCreate(
                ['user_id' => (int)$uid, 'match_id' => (int)$m->id],
                [
                    'source'     => 'live',
                    'language'   => $m->language,
                    'status'     => 'started',
                    'started_at' => $m->started_at ?? $m->created_at ?? now(),
                ]
            );
        }
    }

    private function markLiveFinishedRows(MatchModel $m, int $winnerId, ?int $loserId, int $xp, int $winnerStars): void
    {
        $uids = MatchParticipant::where('match_id', $m->id)->pluck('user_id')->all();
        foreach ($uids as $uid) {
            $uid = (int)$uid;
            if (!$uid) continue;

            $isWinner = ($uid === (int)$winnerId);

            $row = DuelTaken::firstOrNew([
                'user_id'  => $uid,
                'match_id' => (int)$m->id,
            ]);

            $row->source       = 'live';
            $row->language     = (string)$m->language;
            $row->status       = $m->status ?: 'finished'; // 'finished' or 'surrendered'
            $row->is_winner    = $isWinner ? 1 : 0;
            $row->started_at   = $row->started_at ?: ($m->started_at ?? $m->created_at ?? now());
            $row->ended_at     = $m->finished_at ?? now();
            $row->xp_earned    = $isWinner ? max((int)$row->xp_earned, (int)$xp) : (int)$row->xp_earned;
            $row->stars_earned = $isWinner ? max((int)$row->stars_earned, (int)$winnerStars) : (int)$row->stars_earned;
            $row->save();
        }
    }

    private function updateLanguageStats(int $userId, string $language, bool $won): void
    {
        $row = DB::table('user_language_stats')
            ->lockForUpdate()
            ->where('user_id', $userId)
            ->where('language', $language)
            ->first();

        $games   = (int)($row->games_played ?? 0) + 1;
        $wins    = (int)($row->wins ?? 0) + ($won ? 1 : 0);
        $losses  = (int)($row->losses ?? 0) + ($won ? 0 : 1);
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
                'language'     => $language,
                'games_played' => $games,
                'wins'         => $wins,
                'losses'       => $losses,
                'winrate'      => $winrate,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }
    }

    private function checkPvpAchievementsFor(int $userId): void
    {
        // Combine invite + live for PVP achievements
        $played = DuelTaken::where('user_id', $userId)
            ->whereIn('source', ['invite','live'])
            ->whereIn('status', ['finished','surrendered'])
            ->count();

        $won = DuelTaken::where('user_id', $userId)
            ->whereIn('source', ['invite','live'])
            ->where('is_winner', true)
            ->count();

        app(AchievementService::class)->checkAndAwardPvp($userId, $played, $won);
    }
}
