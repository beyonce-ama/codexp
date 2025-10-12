<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\SoloTaken;
use App\Models\DuelTaken;

class AchievementController extends Controller
{
    /**
     * GET /api/achievements/progress
     */
    public function progress(Request $request)
    {
        $user = $request->user();
        $uid  = (int) ($user?->id ?? Auth::id());

        // ---- SOLO: completed count for this user (keep your status value)
        $soloCompleted = SoloTaken::query()
            ->where('user_id', $uid)
            ->where('status', 'completed')
            ->count();

        // ---- PVP (user-scoped via duels_taken)
        // Adjust the 'source' values if your table uses different strings.
        $duelBase = DuelTaken::query()->where('user_id', $uid);

        $invitePlayed = (clone $duelBase)->where('source', 'invite')->count();
        $inviteWon    = (clone $duelBase)->where('source', 'invite')->where('is_winner', true)->count();

        $livePlayed   = (clone $duelBase)->where('source', 'live')->count();
        $liveWon      = (clone $duelBase)->where('source', 'live')->where('is_winner', true)->count();

        $pvpPlayed    = (clone $duelBase)->count();
        $pvpWon       = (clone $duelBase)->where('is_winner', true)->count();

        // ---- Load achievements (optionally filter by scope from query)
        $achievements = Achievement::query()
            ->where(function ($q) {
                $q->where('enabled', true)->orWhereNull('enabled');
            })
            ->when($request->filled('scope'), function ($q) use ($request) {
                $q->whereRaw('UPPER(scope) = ?', [strtoupper((string) $request->input('scope'))]);
            })
            ->orderByRaw("COALESCE(NULLIF(scope,''),'GENERAL') asc")
            ->orderBy('threshold')
            ->get();

        // Map user achievement states
        $userMap = UserAchievement::where('user_id', $uid)
            ->get()
            ->keyBy('achievement_id');

        // Helper: compute "current" value per achievement by code/scope
        $getCurrentForAchievement = function (Achievement $a) use (
            $soloCompleted, $invitePlayed, $inviteWon, $livePlayed, $liveWon, $pvpPlayed, $pvpWon
        ): int {
            $code  = strtoupper((string) $a->code);
            $scope = strtoupper((string) ($a->scope ?? ''));

            // SOLO-based achievements (default)
            if (str_starts_with($code, 'SOLO_') || $scope === 'SOLO' || $scope === 'SOLO+AI') {
                return (int) $soloCompleted;
            }

            // INVITE duel achievements
            if (str_starts_with($code, 'PVP_INVITE_') || $scope === 'INVITE DUEL') {
                if (str_contains($code, '_WIN') || str_contains($code, '_WINS')) {
                    return (int) $inviteWon;
                }
                // default to "played" if not explicitly wins
                return (int) $invitePlayed;
            }

            // LIVE match achievements
            if (str_starts_with($code, 'PVP_LIVE_') || $scope === 'LIVE MATCH') {
                if (str_contains($code, '_WIN') || str_contains($code, '_WINS')) {
                    return (int) $liveWon;
                }
                return (int) $livePlayed;
            }

            // OVERALL PvP (classic + live)
            if (str_starts_with($code, 'PVP_ALL_') || $scope === 'PVP' || $scope === 'DUEL') {
                if (str_contains($code, '_WIN') || str_contains($code, '_WINS')) {
                    return (int) $pvpWon;
                }
                return (int) $pvpPlayed;
            }

            // Fallback: use SOLO completed
            return (int) $soloCompleted;
        };

        $items = [];
        foreach ($achievements as $a) {
            $ua       = $userMap->get($a->id);
            $current  = $getCurrentForAchievement($a);
            $threshold = max(1, (int) $a->threshold); // avoid div-by-zero
            $progress  = min(100, (int) floor(($current / $threshold) * 100));

            // Determine unlocked/claimed, preferring persisted flags; if none, derive unlocked
            $persistUnlocked = (bool) optional($ua)->unlocked_at;
            $claimed         = (bool) optional($ua)->claimed_at;
            $derivedUnlocked = $current >= $threshold;

            $unlocked = $persistUnlocked || $derivedUnlocked;

            // If newly unlocked and no record yet, persist unlocked_at so claiming works
            if ($unlocked && (!$ua || !$persistUnlocked)) {
                // upsert record with unlocked_at
                $ua = $ua ?: new UserAchievement();
                $ua->user_id        = $uid;
                $ua->achievement_id = $a->id;
                if (!$ua->unlocked_at) {
                    $ua->unlocked_at = now();
                }
                // do not set claimed_at here
                $ua->save();
                // refresh flags
                $persistUnlocked = true;
            }

            $items[] = [
                'id'           => (int) $a->id,
                'code'         => $a->code,
                'name'         => $a->name,
                'description'  => $a->description,
                'icon_key'     => $a->icon_key,
                'threshold'    => (int) $a->threshold,
                'xp_reward'    => (int) $a->xp_reward,
                'stars_reward' => (int) $a->stars_reward,
                'current'      => (int) $current,
                'progress'     => (int) $progress,
                'unlocked'     => (bool) $unlocked,
                'claimed'      => (bool) $claimed,
                'can_claim'    => (bool) ($unlocked && !$claimed),
                'scope'        => strtoupper((string) ($a->scope ?? 'GENERAL')),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'solo_completed' => (int) $soloCompleted,
                'items' => $items,
            ],
        ]);
    }

    /**
     * POST /api/achievements/claim
     */
    public function claim(Request $request)
    {
        $data = $request->validate([
            'achievement_id' => ['required', 'integer', 'exists:achievements,id'],
        ]);

        $uid = (int) Auth::id();
        $achievementId = (int) $data['achievement_id'];

        $ach = Achievement::findOrFail($achievementId);

        $ua = UserAchievement::where('user_id', $uid)
            ->where('achievement_id', $achievementId)
            ->first();

        if (!$ua || !$ua->unlocked_at) {
            return response()->json(['success' => false, 'message' => 'Not unlocked yet.'], 422);
        }
        if ($ua->claimed_at) {
            return response()->json(['success' => false, 'message' => 'Already claimed.'], 422);
        }

        DB::transaction(function () use ($uid, $ua, $ach) {
            // Use decimal for XP (season_xp / total_xp are DECIMAL(10,2))
            $xp = (float) ($ach->xp_reward ?? 0);
            $xpDec = number_format($xp, 2, '.', ''); // e.g. "3.00"
            $stars = (int) ($ach->stars_reward ?? 0);

            DB::table('users')->where('id', $uid)->update([
                // Lifetime
                'total_xp'     => DB::raw('COALESCE(total_xp,0) + '.$xpDec),
                'stars'        => DB::raw('COALESCE(stars,0) + '.$stars),

                // Seasonal mirrors
                'season_xp'    => DB::raw('COALESCE(season_xp,0) + '.$xpDec),
                'season_stars' => DB::raw('COALESCE(season_stars,0) + '.$stars),

                'updated_at'   => now(),
            ]);

            $ua->claimed_at = now();
            $ua->save();
        });


        return response()->json([
            'success' => true,
            'data' => [
                'achievement_id' => $achievementId,
                'xp_reward'      => (int) $ach->xp_reward,
                'stars_reward'   => (int) $ach->stars_reward,
            ],
        ]);
    }
}
