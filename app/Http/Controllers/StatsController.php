<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SoloAttempt;
use App\Models\UserLanguageStat;
use App\Models\Duel; // <-- make sure this model exists / adjust namespace
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();

        // -------------------------
        // SOLO AGGREGATES
        // -------------------------
        $soloAttemptsQ = SoloAttempt::where('user_id', $user->id);

        $xp    = (float) $soloAttemptsQ->clone()->sum('xp_earned');
        $stars = (int)   $soloAttemptsQ->clone()->sum('stars_earned');

        $soloAttemptsAll = $soloAttemptsQ->clone()->get();

        $completedChallengeIds = $soloAttemptsAll
            ->where('is_correct', true)
            ->pluck('challenge_id')
            ->unique()
            ->values()
            ->toArray();

        $soloStats = [
            'total_attempts'        => $soloAttemptsAll->count(),
            'successful_attempts'   => $soloAttemptsAll->where('is_correct', true)->count(),
            'attempts_today'        => $soloAttemptsAll->where('created_at', '>=', now()->startOfDay())->count(),
            'completed_challenge_ids' => $completedChallengeIds,
        ];
        $aiAttempts = (int) $user->ai_attempts;
        $aiSuccessfulAttempts = (int) $user->ai_successful_attempts;
        // -------------------------
        // RECENT SOLO ATTEMPTS (for dashboard cards)
        // -------------------------
        $recentSoloAttempts = SoloAttempt::with(['challenge:id,title,mode,difficulty'])
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(function ($a) {
                return [
                    'id'            => (int) $a->id,
                    'is_correct'    => (bool) $a->is_correct,
                    'time_spent_sec'=> (int) ($a->time_spent_sec ?? 0),
                    'xp_earned'     => (int) ($a->xp_earned ?? 0),
                    'stars_earned'  => (int) ($a->stars_earned ?? 0),
                    'created_at'    => (string) $a->created_at,
                    'challenge'     => [
                        'title'      => (string) optional($a->challenge)->title ?? 'Untitled',
                        'mode'       => (string) optional($a->challenge)->mode ?? 'solo',
                        'difficulty' => (string) optional($a->challenge)->difficulty ?? 'unknown',
                    ],
                ];
            })
            ->values()
            ->toArray();

        // -------------------------
        // DUEL AGGREGATES
        // -------------------------
        // If your Duel statuses include cancelled/expired, filter them out here.
        $duelsPlayedQ = Duel::where(function($q) use ($user) {
                $q->where('challenger_id', $user->id)->orWhere('opponent_id', $user->id);
            })
            ->whereIn('status', ['completed','won','lost','draw','finished']); // adjust if needed

        $duelsPlayed       = (int) $duelsPlayedQ->clone()->count();
        $duelsWon          = (int) Duel::where('winner_id', $user->id)->count();
        $duelsAsChallenger = (int) Duel::where('challenger_id', $user->id)->count();
        $duelsAsOpponent   = (int) Duel::where('opponent_id', $user->id)->count();
        $duelsToday        = (int) $duelsPlayedQ->clone()->where('created_at', '>=', now()->startOfDay())->count();
 $duelXp    = (float) Duel::where('winner_id', $user->id)->sum('winner_xp');
        $duelStars = (int)   Duel::where('winner_id', $user->id)->sum('winner_stars');

        // -------------------------
        // RECENT DUELS (for dashboard cards)
        // -------------------------
        $recentDuels = $duelsPlayedQ->clone()
            ->with([
                'challenger:id,name',
                'opponent:id,name',
                'winner:id,name',
            ])
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(function ($d) {
                return [
                    'id'         => (int) $d->id,
                    'status'     => (string) $d->status,
                    'language'   => (string) ($d->language ?? 'unknown'),
                    'created_at' => (string) $d->created_at,
                    'challenger' => ['name' => optional($d->challenger)->name ?? '—'],
                    'opponent'   => ['name' => optional($d->opponent)->name ?? '—'],
                    'winner'     => $d->winner ? ['name' => $d->winner->name] : null,
                ];
            })
            ->values()
            ->toArray();

        // -------------------------
        // LANGUAGE STATS
        // -------------------------
        // Preferred source: your UserLanguageStat table (already in your code)
        $langRows = UserLanguageStat::where('user_id', $user->id)->get();

        // If some fields are missing in UserLanguageStat, we can supplement from duels/solo:
        // Derive duels per language (wins, losses) as a fallback if needed.
        $duelLangAgg = Duel::select('language',
                DB::raw('SUM(CASE WHEN winner_id = '.$user->id.' THEN 1 ELSE 0 END) as wins'),
                DB::raw('SUM(CASE WHEN (challenger_id = '.$user->id.' OR opponent_id = '.$user->id.') AND (winner_id IS NULL OR winner_id <> '.$user->id.') THEN 1 ELSE 0 END) as nonwins')
            )
            ->where(function($q) use ($user) {
                $q->where('challenger_id', $user->id)->orWhere('opponent_id', $user->id);
            })
            ->whereIn('status', ['completed','won','lost','draw','finished'])
            ->groupBy('language')
            ->get()
            ->keyBy(function($r){ return $r->language ?? 'unknown'; });

        // Derive solo completed per language (if you store language per attempt)
        $soloLangAgg = SoloAttempt::select('language', DB::raw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as solo_completed'))
            ->where('user_id', $user->id)
            ->groupBy('language')
            ->get()
            ->keyBy(function($r){ return $r->language ?? 'unknown'; });

        // Normalize language rows to a single shape expected by Dashboard/Profile
        $languageStats = $langRows->map(function($r) use ($duelLangAgg, $soloLangAgg) {
            $language = $r->language ?? 'unknown';

            // Prefer stored values; fallback to derived
            $wins    = (int) ($r->wins ?? optional($duelLangAgg->get($language))->wins ?? 0);
            $losses  = (int) ($r->losses ?? optional($duelLangAgg->get($language))->nonwins ?? 0);
            $games   = (int) ($r->games_played ?? ($wins + $losses));
            $solo    = (int) ($r->solo_completed ?? optional($soloLangAgg->get($language))->solo_completed ?? 0);

            // winrate may be stored as 0..1 or 0..100; normalize to percent (int)
            if (isset($r->winrate)) {
                $wr = is_numeric($r->winrate) ? (float) $r->winrate : 0.0;
                $wr = $wr <= 1 ? $wr * 100 : $wr;
            } else {
                $wr = $games > 0 ? ($wins / max(1, $games)) * 100 : 0;
            }

            return [
                'id'             => (int) ($r->id ?? 0),
                'language'       => (string) $language,
                'games_played'   => $games,
                'wins'           => $wins,
                'losses'         => $losses,
                'winrate'        => (int) round($wr),          // percent for your Dashboard.tsx
                'solo_completed' => $solo,
            ];
        })->values();

        // If you have languages appearing in duels/solo but not in UserLanguageStat, include them
        // (comment out if you prefer to keep only UserLanguageStat rows)
        $allLangKeys = collect(array_unique(array_merge(
            $languageStats->pluck('language')->all(),
            $duelLangAgg->keys()->all(),
            $soloLangAgg->keys()->all(),
        )));
        $languageStats = $allLangKeys->map(function($lang) use ($languageStats, $duelLangAgg, $soloLangAgg) {
            $existing = $languageStats->firstWhere('language', $lang);
            if ($existing) return $existing;

            $wins   = (int) (optional($duelLangAgg->get($lang))->wins ?? 0);
            $nonwin = (int) (optional($duelLangAgg->get($lang))->nonwins ?? 0);
            $games  = $wins + $nonwin;
            $solo   = (int) (optional($soloLangAgg->get($lang))->solo_completed ?? 0);
            $wr     = $games > 0 ? ($wins / max(1, $games)) * 100 : 0;

            return [
                'id'             => 0,
                'language'       => (string) ($lang ?? 'unknown'),
                'games_played'   => (int) $games,
                'wins'           => (int) $wins,
                'losses'         => (int) $nonwin,
                'winrate'        => (int) round($wr),
                'solo_completed' => (int) $solo,
            ];
        })->values();

        // -------------------------
        // RESPONSE (unified shape)
        // -------------------------
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
        // Add AI stats
                'ai_stats' => [
                    'ai_attempts' => $aiAttempts,
                    'ai_successful_attempts' => $aiSuccessfulAttempts,
                ],
                
                  'totals' => [
                    'xp'    => $xp + $duelXp + $user->total_xp,
                    'stars' => $stars + $duelStars,
                ],

                // Solo (both nested and root for backward compatibility)
                'solo_stats' => $soloStats,
                'solo_attempts'       => $soloStats['total_attempts'],
                'successful_attempts' => $soloStats['successful_attempts'],
                'attempts_today'      => $soloStats['attempts_today'],
                'completed_challenge_ids' => $soloStats['completed_challenge_ids'],

                // Duels
                'duels_played'       => $duelsPlayed,
                'duels_won'          => $duelsWon,
                'duels_as_challenger'=> $duelsAsChallenger,
                'duels_as_opponent'  => $duelsAsOpponent,
                'duels_today'        => $duelsToday,

                // Language stats (percent winrate as your Dashboard expects)
                'language_stats' => $languageStats,

                // Recent items (match Dashboard.tsx interfaces)
                'recent_solo_attempts' => $recentSoloAttempts,
                'recent_duels'         => $recentDuels,
            ],
        ]);
    }
}
