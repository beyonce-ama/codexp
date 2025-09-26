<?php

namespace App\Http\Controllers;

use App\Models\Duel;
use App\Models\DuelSubmission;
use App\Models\UserLanguageStat;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\DuelTaken;
use App\Services\AchievementService;

class DuelController extends Controller
{
    private const WIN_XP    = 3.00;
    private const WIN_STARS = 1;

    public function create(Request $request)
    {
        $data = $request->validate([
            'opponent_id' => 'required|exists:users,id',
            'challenge_id'=> 'nullable|exists:challenges_1v1,id',
            'language'    => ['required', Rule::in(['python','java'])],
            'session_duration_minutes' => 'required|integer|min:5|max:30',
        ]);

        // Prevent self-duel
        if ((int)$data['opponent_id'] === (int)$request->user()->id) {
            return response()->json(['success'=>false, 'message'=>'You cannot duel yourself.'], 422);
        }

        $challengerId = $request->user()->id;
        $opponentId   = (int) $data['opponent_id'];
        $challengeId  = (int) ($data['challenge_id'] ?? 0);

        // 1) Block duplicates for same challenger & challenge while duel is open
        $alreadyOpenForChallenger = Duel::query()
            ->where('challenge_id', $challengeId)
            ->where('challenger_id', $challengerId)
            ->whereIn('status', ['pending','active'])
            ->exists();

        if ($alreadyOpenForChallenger) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an open duel for this challenge.',
            ], 422);
        }

        // 2) Block duplicates for the same pair & challenge while open
        $alreadyOpenForPair = Duel::query()
            ->where('challenge_id', $challengeId)
            ->whereIn('status', ['pending','active'])
            ->where(function ($q) use ($challengerId, $opponentId) {
                $q->where(function ($qq) use ($challengerId, $opponentId) {
                    $qq->where('challenger_id', $challengerId)
                       ->where('opponent_id',   $opponentId);
                })->orWhere(function ($qq) use ($challengerId, $opponentId) {
                    $qq->where('challenger_id', $opponentId)
                       ->where('opponent_id',   $challengerId);
                });
            })
            ->exists();

        if ($alreadyOpenForPair) {
            return response()->json([
                'success' => false,
                'message' => 'There is already an open duel with this opponent for this challenge.',
            ], 422);
        }

        // 3) If a fixed challenge is chosen, ensure neither player has taken it.
        if ($challengeId > 0) {
            $alreadyTaken = Duel::query()
                ->where('duels.challenge_id', $challengeId)
                ->whereHas('submissions', function ($q) use ($challengerId, $opponentId) {
                    $q->whereIn('user_id', [$challengerId, $opponentId]);
                })
                ->exists();

            if ($alreadyTaken) {
                return response()->json([
                    'success' => false,
                    'message' => 'This challenge has already been taken by one of the players.',
                ], 422);
            }
        }

        $duel = Duel::create([
            'challenger_id' => $challengerId,
            'opponent_id'   => $opponentId,
            'challenge_id'  => $data['challenge_id'] ?? null,
            'language'      => $data['language'],
            'status'        => 'pending',
            'session_duration_minutes' => $data['session_duration_minutes'],
        ]);

        return response()->json(['success'=>true, 'data'=>$duel], 201);
    }

    public function show(Duel $duel)
    {
        $duel->load(['challenger','opponent','winner','challenge','submissions']);
        return response()->json(['success'=>true, 'data'=>$duel]);
    }

    public function myDuels(Request $request)
    {
        $userId = $request->user()->id;

        $duels = Duel::with(['challenger', 'opponent', 'winner', 'challenge'])
            ->where(function ($q) use ($userId) {
                $q->where('challenger_id', $userId)
                  ->orWhere('opponent_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $duels]);
    }

    public function accept(Request $request, Duel $duel)
    {
        if ($duel->opponent_id !== $request->user()->id) {
            return response()->json(['success'=>false, 'message'=>'Only the invited opponent can accept the duel'], 403);
        }

        if ($duel->status !== 'pending') {
            return response()->json(['success'=>false, 'message'=>'Duel is not pending'], 422);
        }

        $duel->update([
            'status'     => 'active',
            'started_at' => now(),
        ]);

        $this->markDuelStartedRows($duel);

        return response()->json(['success'=>true, 'message'=>'Duel accepted', 'data'=>$duel]);
    }

    public function decline(Request $request, Duel $duel)
    {
        if ($duel->opponent_id !== $request->user()->id) {
            return response()->json(['success'=>false, 'message'=>'Only the invited opponent can decline the duel'], 403);
        }

        if ($duel->status !== 'pending') {
            return response()->json(['success'=>false, 'message'=>'Duel is not pending'], 422);
        }

        $duel->update([
            'status'   => 'declined',
            'ended_at' => now(),
        ]);

        return response()->json(['success'=>true, 'message'=>'Duel declined', 'data'=>$duel]);
    }

    public function start(Request $request, Duel $duel)
    {
        $this->authorizeUser($request->user()->id, $duel);

        if ($duel->status !== 'active') {
            return response()->json(['success'=>false, 'message'=>'Duel is not active'], 422);
        }

        if (!$duel->started_at) {
            $duel->update(['started_at' => now()]);
        }

        return response()->json(['success'=>true, 'message'=>'Duel started', 'data'=>$duel]);
    }

    public function startUserSession(Request $request, Duel $duel)
    {
        $this->authorizeUser($request->user()->id, $duel);

        if ($duel->status !== 'active') {
            return response()->json(['success'=>false, 'message'=>'Duel is not active'], 422);
        }

        $userId = $request->user()->id;
        $field  = $userId === $duel->challenger_id ? 'challenger_started_at' : 'opponent_started_at';

        if (!$duel->$field) {
            $duel->update([$field => now()]);
        }

        $duel->load(['challenger','opponent','winner','challenge','submissions']);
        return response()->json(['success'=>true, 'message'=>'User session started', 'data'=>$duel]);
    }

    public function submit(Request $request, Duel $duel)
    {
        $this->authorizeUser($request->user()->id, $duel);

        $data = $request->validate([
            'code_submitted' => 'required|string',
            'is_correct'     => 'required|boolean',
            'time_spent_sec' => 'required|integer|min:0',
        ]);

        $sub = DuelSubmission::create([
            'duel_id'        => $duel->id,
            'user_id'        => $request->user()->id,
            'code_submitted' => $data['code_submitted'],
            'is_correct'     => $data['is_correct'],
            'judge_feedback' => $data['is_correct'] ? 'Correct' : 'Incorrect',
            'time_spent_sec' => $data['time_spent_sec'],
        ]);

        // Mark when user finishes
        if ($request->user()->id === $duel->challenger_id) {
            $duel->update(['challenger_finished_at' => now()]);
        } else {
            $duel->update(['opponent_finished_at' => now()]);
        }

        // If both finished, resolve
        $duel->refresh();
        $challengerFinished = $duel->challenger_finished_at !== null;
        $opponentFinished   = $duel->opponent_finished_at !== null;

        if ($challengerFinished && $opponentFinished) {
            $this->determineWinner($duel);
        }

        return response()->json(['success'=>true, 'data'=>$sub], 201);
    }

    public function surrender(Request $request, Duel $duel)
    {
        $this->authorizeUser($request->user()->id, $duel);

        if (in_array($duel->status, ['finished','surrendered'], true)) {
            return response()->json(['success'=>true, 'data'=>$duel->load(['challenger','opponent','winner','challenge','submissions'])]);
        }

        // other player becomes winner
        $winnerId = $duel->challenger_id === $request->user()->id
            ? $duel->opponent_id
            : $duel->challenger_id;

        $duel->update([
            'status'       => 'surrendered',
            'winner_id'    => $winnerId,
            'ended_at'     => now(),
            'winner_xp'    => self::WIN_XP,
            'winner_stars' => self::WIN_STARS,
            'duration_sec' => $duel->started_at ? max(0, now()->diffInSeconds($duel->started_at)) : null,
        ]);

        $this->markDuelFinishedRows($duel);
        $this->awardWinnerRewardsToUser($duel);
        $this->applyLoserPenalty($duel);

        // language stats
        $this->bumpWinLoss($duel->challenger_id, $duel->language, $winnerId === $duel->challenger_id);
        $this->bumpWinLoss($duel->opponent_id,   $duel->language, $winnerId === $duel->opponent_id);

        // PVP achievements (both players)
        $this->checkPvpAchievementsFor($duel->challenger_id);
        $this->checkPvpAchievementsFor($duel->opponent_id);

        return response()->json([
            'success' => true,
            'data'    => $duel->fresh()->load(['challenger','opponent','winner','challenge','submissions'])
        ]);
    }

    public function stats(Request $request)
    {
        $userId = $request->user()->id;

        $duels = Duel::where(function ($q) use ($userId) {
                $q->where('challenger_id', $userId)
                  ->orWhere('opponent_id', $userId);
            })->get();

        $won          = $duels->where('winner_id', $userId)->count();
        $asChallenger = $duels->where('challenger_id', $userId)->count();
        $asOpponent   = $duels->where('opponent_id', $userId)->count();
        $today        = $duels->where('created_at', '>=', now()->startOfDay())->count();

        return response()->json([
            'success' => true,
            'data' => [
                'duels_played'       => $duels->count(),
                'duels_won'          => $won,
                'duels_as_challenger'=> $asChallenger,
                'duels_as_opponent'  => $asOpponent,
                'duels_today'        => $today
            ]
        ]);
    }

    public function finalize(Request $request, Duel $duel)
    {
        $this->authorizeUser($request->user()->id, $duel);

        // If already finished and has winner, return fresh
        if ($duel->status === 'finished' && $duel->winner_id) {
            return response()->json(['success' => true, 'data' => $duel->fresh()]);
        }

        // If finished but winner not loaded, load relations and return
        if ($duel->status === 'finished') {
            $duel->load(['challenger','opponent','winner','challenge','submissions']);
            return response()->json(['success' => true, 'data' => $duel]);
        }

        // Ensure both sides have at least one submission
        $hasCh = DuelSubmission::where('duel_id', $duel->id)
            ->where('user_id', $duel->challenger_id)->exists();
        $hasOp = DuelSubmission::where('duel_id', $duel->id)
            ->where('user_id', $duel->opponent_id)->exists();

        if (!$hasCh || !$hasOp) {
            return response()->json(['success' => false, 'message' => 'Not ready to finalize'], 422);
        }

        // Decide winner now
        $this->determineWinner($duel);

        $duel->refresh()->load(['challenger','opponent','winner','challenge','submissions']);
        return response()->json(['success' => true, 'data' => $duel]);
    }

    /* ---------------------- Internals ---------------------- */

    private function authorizeUser(int $userId, Duel $duel): void
    {
        if (!in_array($userId, [$duel->challenger_id, $duel->opponent_id])) {
            abort(403, 'Not your duel');
        }
    }

    private function latestSubmission(int $duelId, int $userId): ?DuelSubmission
    {
        return DuelSubmission::where('duel_id', $duelId)
            ->where('user_id', $userId)
            ->orderByDesc('id')
            ->first();
    }

    private function determineWinner(Duel $duel): void
    {
        $ch = $this->latestSubmission($duel->id, $duel->challenger_id);
        $op = $this->latestSubmission($duel->id, $duel->opponent_id);

        // Should not happen because finalize() guards, but be safe:
        if (!$ch || !$op) {
            return;
        }

        // Winner selection
        if ($ch->is_correct && $op->is_correct) {
            $winnerId = $ch->time_spent_sec < $op->time_spent_sec ? $duel->challenger_id : $duel->opponent_id;
        } elseif ($ch->is_correct) {
            $winnerId = $duel->challenger_id;
        } elseif ($op->is_correct) {
            $winnerId = $duel->opponent_id;
        } else {
            $winnerId = $ch->time_spent_sec < $op->time_spent_sec ? $duel->challenger_id : $duel->opponent_id;
        }

        $duel->update([
            'status'       => 'finished',
            'winner_id'    => $winnerId,
            'ended_at'     => now(),
            'winner_xp'    => self::WIN_XP,
            'winner_stars' => self::WIN_STARS,
            'duration_sec' => $duel->started_at ? max(0, now()->diffInSeconds($duel->started_at)) : null,
        ]);

        $this->markDuelFinishedRows($duel);

        // Language stats
        $this->bumpWinLoss($duel->challenger_id, $duel->language, $winnerId === $duel->challenger_id);
        $this->bumpWinLoss($duel->opponent_id,   $duel->language, $winnerId === $duel->opponent_id);

        // Rewards & penalties
        $this->awardWinnerRewardsToUser($duel);
        $this->applyLoserPenalty($duel);

        // PVP achievements
        $this->checkPvpAchievementsFor($duel->challenger_id);
        $this->checkPvpAchievementsFor($duel->opponent_id);
    }

    private function awardWinnerRewardsToUser(Duel $duel): void
    {
        if (!$duel->winner_id || $duel->winner_xp === null || $duel->winner_stars === null) return;

        DB::transaction(function () use ($duel) {
            $duel->refresh();

            /** @var \App\Models\User $winner */
            $winner = User::lockForUpdate()->find($duel->winner_id);
            if (!$winner) return;

            $winner->total_xp = bcadd((string)$winner->total_xp, (string)$duel->winner_xp, 2);
            $winner->stars    = (int)$winner->stars + (int)$duel->winner_stars;
            $winner->save();
        });
    }

    private function bumpWinLoss(int $userId, string $language, bool $won): void
    {
        $stat = UserLanguageStat::firstOrCreate(['user_id' => $userId, 'language' => $language]);
        $stat->games_played += 1;
        $won ? $stat->wins++ : $stat->losses++;
        $stat->winrate = $stat->games_played > 0 ? round($stat->wins / $stat->games_played, 3) : 0;
        $stat->save();
    }

    private function applyLoserPenalty(Duel $duel): void
    {
        if (!$duel->winner_id) return;

        $winnerId = (int)$duel->winner_id;
        $loserId  = $winnerId === (int)$duel->challenger_id
            ? (int)$duel->opponent_id
            : (int)$duel->challenger_id;

        if ($loserId > 0) {
            User::whereKey($loserId)->update([
                'stars' => DB::raw('GREATEST(COALESCE(stars,0) - 1, 0)')
            ]);
        }
    }

    private function markDuelStartedRows(Duel $duel): void
    {
        foreach ([$duel->challenger_id, $duel->opponent_id] as $uid) {
            if (!$uid) continue;
            DuelTaken::firstOrCreate(
                ['user_id' => $uid, 'duel_id' => $duel->id],
                [
                    'source'     => 'invite',
                    'language'   => $duel->language,
                    'status'     => 'started',
                    'started_at' => $duel->started_at ?? now(),
                ]
            );
        }
    }

    private function markDuelFinishedRows(Duel $duel): void
    {
        $winnerId    = (int) $duel->winner_id;
        $winnerXp    = (int) $duel->winner_xp;
        $winnerStars = (int) $duel->winner_stars;

        foreach ([$duel->challenger_id, $duel->opponent_id] as $uid) {
            if (!$uid) continue;
            $isWinner = ($uid === $winnerId);

            $row = DuelTaken::firstOrNew([
                'user_id' => $uid,
                'duel_id' => $duel->id,
            ]);

            $row->source       = 'invite';
            $row->language     = $duel->language;
            $row->status       = $duel->status; // finished | surrendered
            $row->is_winner    = $isWinner;
            $row->ended_at     = $duel->ended_at ?? now();
            $row->xp_earned    = $isWinner ? max((int)$row->xp_earned, $winnerXp) : (int)$row->xp_earned;
            $row->stars_earned = $isWinner ? max((int)$row->stars_earned, $winnerStars) : (int)$row->stars_earned;
            if (!$row->started_at) $row->started_at = $duel->started_at;
            $row->save();
        }
    }

    private function checkPvpAchievementsFor(int $userId): void
    {
        $played = DuelTaken::where('user_id', $userId)
            ->where('source', 'invite')
            ->whereIn('status', ['finished','surrendered'])
            ->count();

        $won = DuelTaken::where('user_id', $userId)
            ->where('source', 'invite')
            ->where('is_winner', true)
            ->count();

        app(AchievementService::class)->checkAndAwardPvp($userId, $played, $won);
    }
}
