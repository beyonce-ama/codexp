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

    // Get all recent submissions from the database
$recentSubmissions = DB::table('match_submissions')
    ->select('id', 'user_id', 'is_correct', 'created_at')
    ->where('match_id', $match->id)
    ->orderBy('created_at', 'desc')
    ->limit(20)
    ->get()
    ->map(function ($submission) use ($userId) {
        // Ensure consistent types + stable id + ISO time
        $createdAt = $submission->created_at
            ? \Illuminate\Support\Carbon::parse($submission->created_at)->toIso8601String()
            : now()->toIso8601String();

        return [
            'id'         => (string) $submission->id,
            'user_id'    => (int) $submission->user_id,
            'is_correct' => (int) $submission->is_correct,  // keep 0/1 (client normalizes)
            'at'         => $createdAt,
            'by_me'      => ((int) $submission->user_id === (int) $userId),
        ];
    })
    ->values(); // force array indices 0..N


    return response()->json([
        'status' => $match->status,
        'winner_user_id' => $match->winner_user_id ?? null,
        'finished' => $match->status === 'finished',
        'last' => $last,
        'submissions' => $recentSubmissions
    ]);
} /**
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
}