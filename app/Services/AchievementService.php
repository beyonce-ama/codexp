<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Support\Facades\DB;

class AchievementService
{
    /**
     * Check SOLO thresholds and record newly reached achievements (unlocked_at).
     * Rewards are NOT credited here; they are credited on /achievements/claim.
     */
    public function checkAndAwardSolo(int $userId, callable $getSoloCompleted): array
    {
        $awarded = [];

        $completedCount = (int) $getSoloCompleted($userId);

        $candidates = Achievement::query()
            ->where('enabled', true)
            ->where('scope', 'SOLO')
            ->where('threshold', '>', 0)
            ->orderBy('threshold')
            ->get();

        foreach ($candidates as $ach) {
            if ($completedCount >= $ach->threshold) {
                $already = UserAchievement::where('user_id', $userId)
                    ->where('achievement_id', $ach->id)
                    ->exists();

                if (!$already) {
                    DB::transaction(function () use ($userId, $ach, &$awarded) {
                        UserAchievement::create([
                            'user_id'       => $userId,
                            'achievement_id'=> $ach->id,
                            'unlocked_at'   => now(),
                            // claimed_at stays NULL until user claims in UI
                        ]);
                        $awarded[] = $ach->code;
                    });
                }
            }
        }

        return $awarded; // e.g. ['SOLO_5','SOLO_10']
    }
}
