<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChallengeSolo;
use App\Models\SoloAttempt;
use App\Models\UserLanguageStat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class SoloAttemptController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'challenge_id'   => 'required|exists:challenges_solo,id',
            'language'       => 'required|in:python,java,cpp',
            'mode'           => 'required|in:fixbugs,random',
            'time_spent_sec' => 'required|integer|min:0',
            'is_correct'     => 'required|boolean',
            'code_submitted' => 'nullable|string',
            'judge_feedback' => 'nullable|string',
        ]);

        // Fetch the challenge to access its difficulty
        $challenge = ChallengeSolo::findOrFail($data['challenge_id']);

        // Determine XP based on difficulty
        if ($data['is_correct']) {
            switch ($challenge->difficulty) {
                case 'easy':
                    $xp = 1;
                    break;
                case 'medium':
                    $xp = 2;
                    break;
                case 'hard':
                    $xp = 3;
                    break;
                default:
                    $xp = 1; // fallback
                    break;
            }
        } else {
            $xp = 0;
        }

        $stars = 0;

        // Record attempt
        $attempt = SoloAttempt::create([
            'user_id'        => $request->user()->id,
            'challenge_id'   => $challenge->id,
            'language'       => $data['language'],
            'mode'           => $data['mode'],
            'time_spent_sec' => $data['time_spent_sec'],
            'is_correct'     => $data['is_correct'],
            'code_submitted' => $data['code_submitted'] ?? null,
            'judge_feedback' => $data['judge_feedback'] ?? null,
            'xp_earned'      => $xp,
            'stars_earned'   => $stars,
        ]);
    
        // Update per-language stats
        $stat = UserLanguageStat::firstOrCreate([
            'user_id'  => $request->user()->id,
            'language' => $data['language'],
        ]);
        if ($data['is_correct']) $stat->solo_completed += 1;
        $stat->save();

        // Add rewards to user totals
        $this->awardSoloRewardsToUser($request->user()->id, $xp, $stars);           

        return response()->json(['success'=>true, 'data'=>$attempt], 201);
    }

    /**
     * Add solo rewards to the user's aggregate totals.
     * Wrap in a transaction to avoid race conditions (e.g., rapid retries).
     */
    private function awardSoloRewardsToUser(int $userId, float $xp, int $stars = 0): void
    {
        if ($xp <= 0 && $stars <= 0) {
            return; // nothing to add
        }

        DB::transaction(function () use ($userId, $xp, $stars) {
            /** @var \App\Models\User|null $user */
            $user = User::lockForUpdate()->find($userId);
            if (!$user) return;

            // Avoid float drift: handle XP as strings/decimals
            $user->total_xp = bcadd((string)$user->total_xp, (string)$xp, 2);
            $user->season_xp = bcadd((string)$user->total_xp, (string)$xp, 2);
            $user->stars    = (int)$user->stars + (int)$stars;
            $user->save();
        });
    }
}
