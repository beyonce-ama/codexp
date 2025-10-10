<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SoloTaken;
use App\Models\UserLanguageStat;
use App\Models\Duel; // <-- make sure this model exists / adjust namespace
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        // If other parts of the app just updated totals/stars on this request, refresh:
        $user->refresh();

         // -------------------------
        // SOLO TAKEN (from solo_taken table)
        // -------------------------
        $soloTakenQ   = SoloTaken::where('user_id', $user->id);

        // Per-status counts (viewed, started, abandoned, submitted, completed, …)
        $statusCounts = $soloTakenQ->clone()
            ->select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->pluck('cnt', 'status'); // ['completed' => n, 'abandoned' => n, 'viewed' => n, …]

        // Overall & today
        $totalSolo    = (int) $soloTakenQ->clone()->count();
        $todayCount   = (int) $soloTakenQ->clone()
                            ->where('created_at', '>=', now()->startOfDay())
                            ->count();

        // “Successful” := completed
        $completedCount = (int) ($statusCounts['completed'] ?? 0);

        // Completed challenge IDs (distinct)
        $completedChallengeIds = $soloTakenQ->clone()
            ->where('status', 'completed')
            ->pluck('challenge_id')
            ->unique()
            ->values()
            ->toArray();

        $soloStats = [
            'total_attempts'          => $totalSolo,
            'attempts_today'          => $todayCount,
            'status_breakdown'        => [
                'viewed'    => (int) ($statusCounts['viewed'] ?? 0),
                'started'   => (int) ($statusCounts['started'] ?? 0),
                'abandoned' => (int) ($statusCounts['abandoned'] ?? 0),
                'submitted' => (int) ($statusCounts['submitted'] ?? 0),
                'completed' => (int) ($statusCounts['completed'] ?? 0),
            ],
            'successful_attempts'     => $completedCount, // kept for backward compatibility
            'completed_challenge_ids' => $completedChallengeIds,
        ];


        // AI stats derived from solo_taken (mode='aigenerated')
        $aiQ = $soloTakenQ->clone()->where('mode', 'aigenerated');
        $aiAttempts           = (int) $aiQ->clone()->count();
        $aiSuccessfulAttempts = (int) $aiQ->clone()->where('status', 'completed')->count();


        // -------------------------
        // RECENT SOLO ATTEMPTS (for dashboard cards)
        // -------------------------
        $recentSoloAttempts = SoloTaken::with(['challenge:id,title,mode,difficulty'])
        ->where('user_id', $user->id)
        ->latest('created_at')
        ->limit(10)
        ->get()
        ->map(function ($a) {
            return [
                'id'             => (int) $a->id,
                'status'         => (string) ($a->status ?? 'viewed'),
                'language'       => (string) ($a->language ?? 'unknown'),
                'mode'           => (string) ($a->mode ?? 'random'),
                'difficulty'     => (string) ($a->difficulty ?? 'easy'),
                'time_spent_sec' => (int) ($a->time_spent_sec ?? 0),
                'earned_xp'      => (int) ($a->earned_xp ?? 0),
                'submit_count'   => (int) ($a->submit_count ?? 0),
                'created_at'     => (string) $a->created_at,
                'challenge'      => [
                    'title'      => (string) (optional($a->challenge)->title ?? 'Untitled'),
                    'mode'       => (string) (optional($a->challenge)->mode ?? ($a->mode ?? 'solo')),
                    'difficulty' => (string) (optional($a->challenge)->difficulty ?? ($a->difficulty ?? 'unknown')),
                ],
            ];
        })
        ->values()
        ->toArray();


        // -------------------------
        // CLASSIC DUEL AGGREGATES (counts only; NOT used for totals.xp/stars)
        // -------------------------
        $duelFinishedStatuses = ['completed','won','lost','draw','finished']; // adjust if needed

        $duelsPlayedQ = Duel::where(function($q) use ($user) {
                $q->where('challenger_id', $user->id)
                  ->orWhere('opponent_id', $user->id);
            })
            ->whereIn('status', $duelFinishedStatuses);

        $duelsPlayed        = (int) $duelsPlayedQ->clone()->count();
        $duelsWon           = (int) Duel::where('winner_id', $user->id)->whereIn('status', $duelFinishedStatuses)->count();
        $duelsAsChallenger  = (int) Duel::where('challenger_id', $user->id)->count();
        $duelsAsOpponent    = (int) Duel::where('opponent_id', $user->id)->count();
        $duelsTodayClassic  = (int) $duelsPlayedQ->clone()->where('created_at', '>=', now()->startOfDay())->count();

        // -------------------------
        // RECENT CLASSIC DUELS
        // -------------------------
        $recentDuelsClassic = $duelsPlayedQ->clone()
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
                    'source'     => 'duel',
                ];
            });

        // -------------------------
        // LIVE MATCHES (matches + match_participants) — counts only
        // -------------------------
        // Treat a match as finished if finished_at is set OR status is in this list
        $matchFinishedStatuses = ['finished','completed','resolved','won','lost','timeout'];

        // Played: any finished match where this user is a participant
        $matchesPlayed = (int) DB::table('matches as m')
            ->join('match_participants as mp', 'mp.match_id', '=', 'm.id')
            ->where('mp.user_id', $user->id)
            ->where(function ($q) use ($matchFinishedStatuses) {
                $q->whereNotNull('m.finished_at')
                  ->orWhereIn('m.status', $matchFinishedStatuses);
            })
            ->count();

        // Won: finished matches where winner_user_id = me
        $matchesWon = (int) DB::table('matches as m')
            ->where('m.winner_user_id', $user->id)
            ->where(function ($q) use ($matchFinishedStatuses) {
                $q->whereNotNull('m.finished_at')
                  ->orWhereIn('m.status', $matchFinishedStatuses);
            })
            ->count();

        // Today: any match created today where I’m a participant (regardless of status)
        $matchesToday = (int) DB::table('matches as m')
            ->join('match_participants as mp', 'mp.match_id', '=', 'm.id')
            ->where('mp.user_id', $user->id)
            ->whereDate('m.created_at', now()->toDateString())
            ->count();

        // -------------------------
        // MERGED PVP (classic + live)
        // -------------------------
        $pvpPlayed  = $duelsPlayed + $matchesPlayed;
        $pvpWon     = $duelsWon   + $matchesWon;
        $pvpWinrate = $pvpPlayed > 0 ? (int) round(($pvpWon / max(1, $pvpPlayed)) * 100) : 0;

        // Keep old 'duels_today' tile meaningful by including live;
        // also return classic-only for reference.
        $duelsToday = $duelsTodayClassic + $matchesToday;

        // -------------------------
        // RECENT LIVE MATCHES
        // -------------------------
        // opponent = "the other participant" in the same match (no role column in mp)
        $recentMatches = DB::table('matches as m')
            // my row
            ->join('match_participants as mp_me', function($j) use ($user) {
                $j->on('mp_me.match_id','=','m.id')->where('mp_me.user_id','=',$user->id);
            })
            // other participant
            ->join('match_participants as mp_opp', function($j) use ($user) {
                $j->on('mp_opp.match_id','=','m.id')->where('mp_opp.user_id','<>',$user->id);
            })
            ->leftJoin('users as me',  'me.id',  '=', 'mp_me.user_id')
            ->leftJoin('users as opp', 'opp.id', '=', 'mp_opp.user_id')
            ->leftJoin('users as w',   'w.id',   '=', 'm.winner_user_id')
            ->orderByDesc('m.created_at')
            ->limit(10)
            ->get([
                'm.id','m.status','m.language','m.created_at',
                DB::raw("'live' as source"),
                DB::raw('me.name as challenger_name'),
                DB::raw('opp.name as opponent_name'),
                DB::raw('w.name as winner_name'),
            ])
            ->map(function ($r) {
                return [
                    'id'         => (int) $r->id,
                    'status'     => (string) $r->status,
                    'language'   => (string) ($r->language ?? 'unknown'),
                    'created_at' => (string) $r->created_at,
                    'challenger' => ['name' => $r->challenger_name ?? '—'],
                    'opponent'   => ['name' => $r->opponent_name ?? '—'],
                    'winner'     => $r->winner_name ? ['name' => $r->winner_name] : null,
                    'source'     => 'live',
                ];
            });

        // Merge & take newest 10 across both sources
        $recentDuels = $recentDuelsClassic
            ->concat($recentMatches)
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->toArray();

        // -------------------------
        // LANGUAGE STATS
        // -------------------------
        $langRows = UserLanguageStat::where('user_id', $user->id)->get();

        // Derive classic duels per language (wins / nonwins)
        $duelFinishedStatuses = ['completed','won','lost','draw','finished'];
        $duelLangAgg = Duel::select('language',
                DB::raw('SUM(CASE WHEN winner_id = '.$user->id.' THEN 1 ELSE 0 END) as wins'),
                DB::raw('SUM(CASE WHEN (challenger_id = '.$user->id.' OR opponent_id = '.$user->id.') AND (winner_id IS NULL OR winner_id <> '.$user->id.') THEN 1 ELSE 0 END) as nonwins')
            )
            ->where(function($q) use ($user) {
                $q->where('challenger_id', $user->id)->orWhere('opponent_id', $user->id);
            })
            ->whereIn('status', $duelFinishedStatuses)
            ->groupBy('language')
            ->get()
            ->keyBy(function($r){ return $r->language ?? 'unknown'; });

        // Derive solo completed per language
       $soloLangAgg = SoloTaken::select('language', DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as solo_completed'))
        ->where('user_id', $user->id)
        ->groupBy('language')
        ->get()
        ->keyBy(function($r){ return $r->language ?? 'unknown'; });


        // OPTIONALLY blend live matches into language wins/losses
        $matchFinishedStatuses = ['finished','completed','resolved','won','lost','timeout'];
        $liveLangAgg = DB::table('matches as m')
            ->join('match_participants as mp', 'mp.match_id', '=', 'm.id')
            ->select('m.language',
                DB::raw('SUM(CASE WHEN m.winner_user_id = '.$user->id.' THEN 1 ELSE 0 END) as wins'),
                DB::raw('SUM(CASE WHEN mp.user_id = '.$user->id.' AND (m.winner_user_id IS NULL OR m.winner_user_id <> '.$user->id.') THEN 1 ELSE 0 END) as nonwins')
            )
            ->where('mp.user_id', $user->id)
            ->where(function ($q) use ($matchFinishedStatuses) {
                $q->whereNotNull('m.finished_at')
                  ->orWhereIn('m.status', $matchFinishedStatuses);
            })
            ->groupBy('m.language')
            ->get()
            ->keyBy(function($r){ return $r->language ?? 'unknown'; });

        // Normalize language rows to a single shape expected by Dashboard/Profile
        $languageStats = $langRows->map(function($r) use ($duelLangAgg, $soloLangAgg, $liveLangAgg) {
            $language = $r->language ?? 'unknown';

            // classic + live
            $winsClassic   = (int) (optional($duelLangAgg->get($language))->wins ?? 0);
            $nonwinsClassic= (int) (optional($duelLangAgg->get($language))->nonwins ?? 0);
            $winsLive      = (int) (optional($liveLangAgg->get($language))->wins ?? 0);
            $nonwinsLive   = (int) (optional($liveLangAgg->get($language))->nonwins ?? 0);

            $wins   = (int) (($r->wins ?? 0) ?: ($winsClassic + $winsLive));
            $losses = (int) (($r->losses ?? 0) ?: ($nonwinsClassic + $nonwinsLive));
            $games  = (int) (($r->games_played ?? 0) ?: ($wins + $losses));

            $solo   = (int) ($r->solo_completed ?? optional($soloLangAgg->get($language))->solo_completed ?? 0);

            // winrate may be stored as 0..1 or 0..100; normalize to percent (int)
            if (isset($r->winrate) && $r->winrate !== null) {
                $wr = is_numeric($r->winrate) ? (float) $r->winrate : 0.0;
                $wr = $wr <= 1 ? $wr * 100 : $wr;
            } else {
                $wr = $games > 0 ? ($wins / max(1, $games)) * 100 : 0;
            }

            return [
                'id'             => (int) ($r->id ?? 0),
                'language'       => (string) $language,
                'games_played'   => (int) $games,
                'wins'           => (int) $wins,
                'losses'         => (int) $losses,
                'winrate'        => (int) round($wr),
                'solo_completed' => (int) $solo,
            ];
        })->values();

        // Include languages present only in derived sources
        $allLangKeys = collect(array_unique(array_merge(
            $languageStats->pluck('language')->all(),
            $duelLangAgg->keys()->all(),
            $liveLangAgg->keys()->all(),
            $soloLangAgg->keys()->all(),
        )));
        $languageStats = $allLangKeys->map(function($lang) use ($languageStats, $duelLangAgg, $liveLangAgg, $soloLangAgg) {
            $existing = $languageStats->firstWhere('language', $lang);
            if ($existing) return $existing;

            $wins   = (int) ((optional($duelLangAgg->get($lang))->wins ?? 0) + (optional($liveLangAgg->get($lang))->wins ?? 0));
            $nonwin = (int) ((optional($duelLangAgg->get($lang))->nonwins ?? 0) + (optional($liveLangAgg->get($lang))->nonwins ?? 0));
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
        // RESPONSE
        // -------------------------
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,

                // AI stats
                'ai_stats' => [
                    'ai_attempts'             => $aiAttempts,
                    'ai_successful_attempts'  => $aiSuccessfulAttempts,
                ],

                // Totals (SINGLE SOURCE OF TRUTH = users table)
                'totals' => [
                    'xp'    => (float) ($user->total_xp ?? 0),
                    'stars' => (int)   ($user->stars    ?? 0),
                ],

                // Solo (both nested and root for backward compatibility)
                'solo_stats'              => $soloStats,
                'solo_attempts'           => $soloStats['total_attempts'],
                'successful_attempts'     => $soloStats['successful_attempts'],
                'attempts_today'          => $soloStats['attempts_today'],
                'completed_challenge_ids' => $soloStats['completed_challenge_ids'],

                // Classic duels
                'duels_played'        => $duelsPlayed,
                'duels_won'           => $duelsWon,
                'duels_as_challenger' => $duelsAsChallenger,
                'duels_as_opponent'   => $duelsAsOpponent,

                // Today tile (merged)
                'duels_today'         => $duelsToday,           // classic + live
                'duels_today_classic' => $duelsTodayClassic,    // for reference
                'matches_today'       => $matchesToday,

                // Live matches (aliases)
                'matches_played'      => $matchesPlayed,
                'matches_won'         => $matchesWon,
                'live_played'         => $matchesPlayed,
                'live_won'            => $matchesWon,

                // Merged PvP (for an accurate overall winrate)
                'pvp_played'          => $pvpPlayed,
                'pvp_won'             => $pvpWon,
                'pvp_winrate'         => $pvpWinrate, // percent int

                // Language stats & recents
                'language_stats'        => $languageStats,
                'recent_solo_attempts'  => $recentSoloAttempts,
                'recent_duels'          => $recentDuels,
            ],
        ]);
    }
}
