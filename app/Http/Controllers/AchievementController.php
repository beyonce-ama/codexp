<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;                 // <-- THIS fixes the error
use Illuminate\Support\Facades\Auth;         // needed below
use Illuminate\Support\Facades\DB;           // needed below
use App\Models\Achievement;                  // models used below
use App\Models\UserAchievement;
use App\Models\SoloTaken;

class AchievementController extends Controller
{
    // GET /api/achievements/progress
    public function progress(Request $request)
    {
        $uid = Auth::id();

        $soloCompleted = SoloTaken::query()
            ->where('user_id', $uid)
            ->where('status', 'completed')   // lowercase matches your SoloUsageController
            ->count();

$achievements = Achievement::query()
    // treat NULL as enabled, or pass ?scope=... to filter
    ->where(function ($q) {
        $q->where('enabled', true)->orWhereNull('enabled');
    })
    ->when($request->filled('scope'), function ($q) use ($request) {
        $q->whereRaw('UPPER(scope) = ?', [strtoupper((string)$request->input('scope'))]);
    })
    ->orderByRaw("COALESCE(NULLIF(scope,''),'GENERAL') asc")
    ->orderBy('threshold')
    ->get();

        $userMap = UserAchievement::where('user_id', $uid)
            ->get()
            ->keyBy('achievement_id');

        $items = $achievements->map(function ($a) use ($soloCompleted, $userMap) {
            $ua = $userMap->get($a->id);
            $unlocked = (bool) optional($ua)->unlocked_at;
            $claimed  = (bool) optional($ua)->claimed_at;
            $progress = min(100, (int) floor(($soloCompleted / max(1,$a->threshold))*100));

 return [
    'id'           => $a->id,
    'code'         => $a->code,
    'name'         => $a->name,
    'description'  => $a->description,
    'icon_key'     => $a->icon_key,
    'threshold'    => (int) $a->threshold,
    'xp_reward'    => (int) $a->xp_reward,
    'stars_reward' => (int) $a->stars_reward,
    'current'      => (int) $soloCompleted,
    'progress'     => (int) $progress,
    'unlocked'     => (bool) $unlocked,
    'claimed'      => (bool) $claimed,
    'can_claim'    => (bool) ($unlocked && !$claimed),
    'scope'        => strtoupper((string)($a->scope ?? 'GENERAL')), // helpful for UI
];

        });

        return response()->json([
            'success' => true,
            'data' => [
                'solo_completed' => $soloCompleted,
                'items' => $items,
            ],
        ]);
    }

    // POST /api/achievements/claim
    public function claim(Request $request)
    {
        $data = $request->validate([
            'achievement_id' => ['required','integer','exists:achievements,id'],
        ]);

        $uid = Auth::id();
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
            // credit rewards now
            DB::table('users')->where('id', $uid)->update([
                'stars'    => DB::raw('COALESCE(stars,0) + '.((int)$ach->stars_reward)),
                'total_xp' => DB::raw('COALESCE(total_xp,0) + '.((int)$ach->xp_reward)),
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
