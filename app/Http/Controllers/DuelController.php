<?php

namespace App\Http\Controllers;

use App\Models\Duel;
use App\Models\DuelSubmission;
use App\Models\UserLanguageStat;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Models\User;


class DuelController extends Controller
{
    public function create(Request $request)
    {
        $data = $request->validate([
            'opponent_id' => 'required|exists:users,id|different:me',
            'challenge_id'=> 'nullable|exists:challenges_1v1,id',
            'language'    => ['required', Rule::in(['python','java'])],
            'session_duration_minutes' => 'required|integer|min:5|max:30',
        ],[
            'opponent_id.different' => 'You cannot duel yourself.',
        ]);

        $challengerId = $request->user()->id;
        $opponentId   = (int) $data['opponent_id'];
        $challengeId  = (int) ($data['challenge_id'] ?? 0);

        // 1) Block duplicates for same challenger & challenge while duel is open
        $alreadyOpenForChallenger = \App\Models\Duel::query()
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

        // 2) (Optional) Block duplicates for the *same pair* and challenge while open
        $alreadyOpenForPair = \App\Models\Duel::query()
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

        // If a fixed challenge is chosen, ensure neither player has taken it.
        if ($challengeId > 0) {
            $alreadyTaken = \App\Models\Duel::query()
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
            'challenger_id' => $request->user()->id,
            'opponent_id'   => $data['opponent_id'],
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
            ->where('challenger_id', $userId)
            ->orWhere('opponent_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $duels]);
    }

    public function accept(Request $request, Duel $duel)
    {
        if ($duel->opponent_id !== $request->user()->id) {
            return response()->json(['success'=>false, 'message'=>'Only opponent can accept the duel'], 403);
        }

        if ($duel->status !== 'pending') {
            return response()->json(['success'=>false, 'message'=>'Duel is not pending'], 422);
        }

        $duel->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        return response()->json(['success'=>true, 'message'=>'Duel accepted', 'data'=>$duel]);
    }

    public function decline(Request $request, Duel $duel)
    {
        if ($duel->opponent_id !== $request->user()->id) {
            return response()->json(['success'=>false, 'message'=>'Only opponent can decline the duel'], 403);
        }

        if ($duel->status !== 'pending') {
            return response()->json(['success'=>false, 'message'=>'Duel is not pending'], 422);
        }

        $duel->update([
            'status' => 'declined',
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
            $duel->update([
                'started_at' => now(),
            ]);
        }

        return response()->json(['success'=>true, 'message'=>'Duel started', 'data'=>$duel]);
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

        // Check if both players have finished
        $challengerFinished = $duel->challenger_finished_at !== null;
        $opponentFinished = $duel->opponent_finished_at !== null;

        if ($challengerFinished && $opponentFinished) {
            $this->determineWinner($duel);
        }

        return response()->json(['success'=>true, 'data'=>$sub], 201);
    }

   public function surrender(Request $request, Duel $duel)
    {
        $this->authorizeUser($request->user()->id, $duel);

        if ($duel->status === 'finished' || $duel->status === 'surrendered') {
            return response()->json(['success'=>true, 'data'=>$duel->load(['challenger','opponent','winner','challenge','submissions'])]);
        }

        // the other player becomes winner
        $winnerId = $duel->challenger_id === $request->user()->id
            ? $duel->opponent_id
            : $duel->challenger_id;

        $duel->update([
            'status'       => 'surrendered',   // ← set surrendered
            'winner_id'    => $winnerId,
            'ended_at'     => now(),
            'winner_xp'    => 2.00,
            'winner_stars' => 1,
        ]);
        $this->awardWinnerRewardsToUser($duel);

        $this->applyLoserPenalty($duel);

        // keep your language stats updates
        $this->bumpWinLoss($duel->challenger_id, $duel->language, $winnerId === $duel->challenger_id);
        $this->bumpWinLoss($duel->opponent_id,   $duel->language, $winnerId === $duel->opponent_id);

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

        $won = $duels->where('winner_id', $userId)->count();
        $asChallenger = $duels->where('challenger_id', $userId)->count();
        $asOpponent = $duels->where('opponent_id', $userId)->count();
        $today = $duels->where('created_at', '>=', now()->startOfDay())->count();

        return response()->json([
            'success' => true,
            'data' => [
                'duels_played' => $duels->count(),
                'duels_won' => $won,
                'duels_as_challenger' => $asChallenger,
                'duels_as_opponent' => $asOpponent,
                'duels_today' => $today
            ]
        ]);
    }

    private function determineWinner(Duel $duel): void
    {
        $challengerSubmission = DuelSubmission::where('duel_id', $duel->id)
            ->where('user_id', $duel->challenger_id)
            ->first();
            
        $opponentSubmission = DuelSubmission::where('duel_id', $duel->id)
            ->where('user_id', $duel->opponent_id)
            ->first();

        $winnerId = null;
        
        // Both submitted correct answers - faster wins
        if ($challengerSubmission->is_correct && $opponentSubmission->is_correct) {
            $winnerId = $challengerSubmission->time_spent_sec < $opponentSubmission->time_spent_sec 
                ? $duel->challenger_id 
                : $duel->opponent_id;
        }
        // Only challenger correct
        elseif ($challengerSubmission->is_correct) {
            $winnerId = $duel->challenger_id;
        }
        // Only opponent correct
        elseif ($opponentSubmission->is_correct) {
            $winnerId = $duel->opponent_id;
        }
        // Neither correct - faster submission wins
        else {
            $winnerId = $challengerSubmission->time_spent_sec < $opponentSubmission->time_spent_sec 
                ? $duel->challenger_id 
                : $duel->opponent_id;
        }

       $duel->update([
            'status'       => 'finished',
            'winner_id'    => $winnerId,
            'ended_at'     => now(),
            'winner_xp'    => 2.00,
            'winner_stars' => 1,
        ]);

        // Update per-language W/L
        $this->bumpWinLoss($duel->challenger_id, $duel->language, $winnerId === $duel->challenger_id);
        $this->bumpWinLoss($duel->opponent_id,   $duel->language, $winnerId === $duel->opponent_id);

        // NEW: push rewards to the winner's user record
        $this->awardWinnerRewardsToUser($duel);

        // NEW: apply a single loser penalty
        $this->applyLoserPenalty($duel);


    }

    public function startUserSession(Request $request, Duel $duel)
    {
        $this->authorizeUser($request->user()->id, $duel);

        if ($duel->status !== 'active') {
            return response()->json(['success'=>false, 'message'=>'Duel is not active'], 422);
        }

        $userId = $request->user()->id;
        $field = $userId === $duel->challenger_id ? 'challenger_started_at' : 'opponent_started_at';
        if (!$duel->$field) {
            $duel->update([$field => now()]);
        }

        $duel->load(['challenger','opponent','winner','challenge','submissions']);
        return response()->json(['success'=>true, 'message'=>'User session started', 'data'=>$duel]);
    }
    private function authorizeUser(int $userId, Duel $duel): void
    {
        if (!in_array($userId, [$duel->challenger_id, $duel->opponent_id])) {
            abort(403, 'Not your duel');
        }
    }
    public function finalize(Request $request, Duel $duel)
    {
        $this->authorizeUser($request->user()->id, $duel);
        if ($duel->status === 'finished' && $duel->winner_id) {
    return response()->json([
        'success' => true,
        'data' => $duel->fresh()
    ]);
}

        if ($duel->status === 'finished') {
            $duel->load(['challenger','opponent','winner','challenge','submissions']);
            return response()->json(['success' => true, 'data' => $duel]);
        }

        // ensure both sides have submitted
        $subs = DuelSubmission::where('duel_id', $duel->id)->count();
        if ($subs < 2) {
            return response()->json(['success' => false, 'message' => 'Not ready to finalize'], 422);
        }

        // reuse your existing winner logic
        $this->determineWinner($duel);

        $duel->refresh()->load(['challenger','opponent','winner','challenge','submissions']);
        return response()->json(['success' => true, 'data' => $duel]);
    }

    private function awardWinnerRewardsToUser(Duel $duel): void
    {
        
        if (!$duel->winner_id || $duel->winner_xp === null || $duel->winner_stars === null) {
            return;
        }

        DB::transaction(function () use ($duel) {
            // Lock the duel row to avoid double-award in race conditions (optional but nice).
            $duel->refresh();

            // Fetch winner
            /** @var \App\Models\User $winner */
            $winner = User::lockForUpdate()->find($duel->winner_id);
            if (!$winner) return;

            // Update winner tallies. Avoid float issues by casting to string/decimal where needed.
            // increment() may not support decimals consistently across drivers, so add & save.
            $winner->total_xp = bcadd((string)$winner->total_xp, (string)$duel->winner_xp, 2);
            $winner->stars    = (int)$winner->stars + (int)$duel->winner_stars;
            $winner->save();

          

            // $duel->update(['rewards_applied' => true]);
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
    $loserId = $winnerId === (int)$duel->challenger_id
        ? (int)$duel->opponent_id
        : (int)$duel->challenger_id;

    if ($loserId > 0) {
        User::whereKey($loserId)->update([
            'stars' => DB::raw('GREATEST(COALESCE(stars,0) - 1, 0)')
        ]);
    }
}

}