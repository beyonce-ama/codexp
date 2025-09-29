<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Http\Middleware\CheckRole;
use App\Models\User;

/* Controllers */
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChallengeSoloController;
use App\Http\Controllers\Challenge1v1Controller;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\SoloAttemptController;
use App\Http\Controllers\DuelController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AIChallengeController;
use App\Http\Controllers\MatchmakingController;
use App\Http\Controllers\MatchRuntimeController;
use App\Http\Controllers\SoloUsageController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\PreferencesController;

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

/* Guest only */
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Authenticated + Verified (SPA session; CSRF-protected)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    /*
    |-------------------------
    | PAGES (shared/participant)
    |-------------------------
    */
    Route::get('/dashboard', function () {
        return match (Auth::user()->role ?? 'participant') {
            'admin'      => Inertia::render('Admin/Dashboard'),
            default      => Inertia::render('Participant/Dashboard'),
        };
    })->name('dashboard');

    Route::get('/faq', fn () => Inertia::render('System/FAQ'))->name('system.faq');

    // Participant-only pages
    Route::middleware([CheckRole::class . ':participant'])->group(function () {
        Route::get('/play/solo', fn () => Inertia::render('Participant/Solo'))->name('participant.solo');
        Route::get('/play/ai-challenges', fn () => Inertia::render('Participant/AIChallenges'))->name('participant.ai-challenges');
        Route::get('/play/practice', fn () => Inertia::render('Participant/Practice'))->name('participant.practice');
        Route::get('/play/duel', fn () => Inertia::render('Participant/Duel'))->name('participant.duel');
        Route::get('/play/matchmaking', fn () => Inertia::render('Participant/Matchmaking'))->name('participant.matchmaking');
        Route::get('/profile', fn () => Inertia::render('Participant/Profile'))->name('participant.profile');
    });

    // Match runtime page(s)
    Route::get('/play/m/{slug}', [MatchRuntimeController::class, 'show'])->name('match.show');
    Route::get('/play/match/{matchId}', [MatchRuntimeController::class, 'show'])->whereNumber('matchId');

    /*
    |-------------------------
    | DASHBOARD STATS (kept path)
    |-------------------------
    */
    Route::get('/dashboard/stats', function () {
        $user = auth()->user();

        // Helpers
        $safeCount = function ($table) {
            try { return DB::table($table)->count(); } catch (Exception $e) { return 0; }
        };
        $safeCountWhere = function ($table, $column, $value) {
            try { return DB::table($table)->where($column, $value)->count(); } catch (Exception $e) { return 0; }
        };
        $safeCountWhereDate = function ($table, $column, $date) {
            try { return DB::table($table)->whereDate($column, $date)->count(); } catch (Exception $e) { return 0; }
        };

        if ($user->role === 'admin') {
            return response()->json([
                'success' => true,
                'data' => [
                    // --- User Stats ---
                    'total_users'       => $safeCount('users'),
                    'admin_users'       => $safeCountWhere('users', 'role', 'admin'),
                    'participant_users' => $safeCountWhere('users', 'role', 'participant'),
                    'new_users_today'   => $safeCountWhereDate('users', 'created_at', today()),

                    // --- Solo Challenge Stats ---
                    'total_solo_challenges'   => $safeCount('challenges_solo'),
                    'solo_python_challenges'  => $safeCountWhere('challenges_solo', 'language', 'python'),
                    'solo_java_challenges'    => $safeCountWhere('challenges_solo', 'language', 'java'),
                    'solo_easy'   => $safeCountWhere('challenges_solo', 'difficulty', 'easy'),
                    'solo_medium' => $safeCountWhere('challenges_solo', 'difficulty', 'medium'),
                    'solo_hard'   => $safeCountWhere('challenges_solo', 'difficulty', 'hard'),

                    // --- 1v1 Challenge Stats ---
                    'total_1v1_challenges'   => $safeCount('challenges_1v1'),
                    'duel_python_challenges' => $safeCountWhere('challenges_1v1', 'language', 'python'),
                    'duel_java_challenges'   => $safeCountWhere('challenges_1v1', 'language', 'java'),
                    'duel_easy'   => $safeCountWhere('challenges_1v1', 'difficulty', 'easy'),
                    'duel_medium' => $safeCountWhere('challenges_1v1', 'difficulty', 'medium'),
                    'duel_hard'   => $safeCountWhere('challenges_1v1', 'difficulty', 'hard'),

                    // --- Platform Activity ---
                    'total_solo_attempts'      => $safeCount('solo_taken'),
                    'successful_solo_attempts' => $safeCountWhere('solo_taken', 'status', 'completed'),

                    'total_duels'              => $safeCount('duels_taken'),
                    'completed_duels'          => $safeCountWhere('duels_taken', 'status', 'finished'),
                    'pending_duels'            => $safeCountWhere('duels_taken', 'status', 'started'),

                    // --- Today's Activity ---
                    'solo_attempts_today' => $safeCountWhereDate('solo_taken', 'created_at', today()),
                    'duels_today'         => $safeCountWhereDate('duels_taken', 'created_at', today()),

                    // --- Language Popularity ---
                    'python_attempts' => DB::table('solo_taken')->where('language','python')->count()
                                     + DB::table('duels_taken')->where('language','python')->count(),
                    'java_attempts'   => DB::table('solo_taken')->where('language','java')->count()
                                     + DB::table('duels_taken')->where('language','java')->count(),

                    // --- Feedback (safe fallback) ---
                    'total_feedbacks'    => $safeCount('feedback'),
                    'open_feedbacks'     => $safeCountWhere('feedback', 'status', 'open'),
                    'resolved_feedbacks' => $safeCountWhere('feedback', 'status', 'resolved'),

                    // --- Characters ---
                    'total_characters' => $safeCount('characters'),
                ]
            ]);
        }

        // --- Participant (unchanged) ---
        $userId = $user->id;
        return response()->json([
            'success' => true,
            'data' => [
                'solo_attempts' => $safeCountWhere('solo_attempts', 'user_id', $userId),
                'successful_attempts' => (function () use ($userId) {
                    try {
                        return DB::table('solo_attempts')
                            ->where('user_id', $userId)
                            ->where('is_correct', 1)
                            ->count();
                    } catch (Exception $e) { return 0; }
                })(),
                'total_xp' => (function () use ($userId) {
                    try {
                        return (float) DB::table('solo_attempts')
                            ->where('user_id', $userId)
                            ->sum('xp_earned') ?: 0;
                    } catch (Exception $e) { return 0; }
                })(),
                'total_stars' => (function () use ($userId) {
                    try {
                        return (int) DB::table('solo_attempts')
                            ->where('user_id', $userId)
                            ->sum('stars_earned') ?: 0;
                    } catch (Exception $e) { return 0; }
                })(),
                'duels_played' => (function () use ($userId) {
                    try {
                        return DB::table('duels')
                            ->where('challenger_id', $userId)
                            ->orWhere('opponent_id', $userId)
                            ->count();
                    } catch (Exception $e) { return 0; }
                })(),
                'duels_won' => $safeCountWhere('duels', 'winner_id', $userId),
                'duels_as_challenger' => $safeCountWhere('duels', 'challenger_id', $userId),
                'duels_as_opponent'   => $safeCountWhere('duels', 'opponent_id', $userId),
                'language_stats'      => [],
                'recent_solo_attempts'=> [],
                'recent_duels'        => [],
                'attempts_today' => (function () use ($userId) {
                    try {
                        return DB::table('solo_attempts')
                            ->where('user_id', $userId)
                            ->whereDate('created_at', today())
                            ->count();
                    } catch (Exception $e) { return 0; }
                })(),
                'duels_today' => (function () use ($userId) {
                    try {
                        return DB::table('duels')
                            ->where(function ($q) use ($userId) {
                                $q->where('challenger_id', $userId)
                                  ->orWhere('opponent_id', $userId);
                            })
                            ->whereDate('created_at', today())
                            ->count();
                    } catch (Exception $e) { return 0; }
                })(),
            ]
        ]);
    })->name('dashboard.stats');

    /*
    |-------------------------
    | SPA API (session + CSRF)
    |-------------------------
    */
    Route::prefix('api')->group(function () {

        // Simple test
        Route::get('/test', fn () => response()->json([
            'success' => true,
            'user'    => auth()->user(),
            'message' => 'API is working via web routes'
        ]));

        /*
        | Me / Profile
        */
        Route::prefix('me')->group(function () {
            Route::get('/', [ProfileController::class, 'me'])->name('api.me');
            Route::get('/stats', [StatsController::class, 'me'])->name('api.me.stats');
            Route::get('/profile', [ProfileController::class, 'show'])->name('api.me.profile.show');
            Route::put('/profile', [ProfileController::class, 'update'])->name('api.me.profile.update');
            // Optional dedicated avatar endpoint (helps when sending multipart)
            Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('api.me.profile.avatar');
        });
        Route::match(['POST','PATCH'], '/me/preferences', [PreferencesController::class, 'update'])
            ->name('api.me.preferences.update');

        /*
        | Achievements
        */
        Route::get('/achievements/progress', [\App\Http\Controllers\AchievementController::class, 'progress']);
        Route::post('/achievements/claim',    [\App\Http\Controllers\AchievementController::class, 'claim']);

        /*
        | Solo usage tracking
        */
        Route::post('/solo/attempts',   [SoloUsageController::class, 'storeAttempt']);
        Route::post('/solo/mark-taken', [SoloUsageController::class, 'markTaken']);
        Route::get('/solo/taken',       [SoloUsageController::class, 'listTaken']);

        /*
        | Challenge browsing (shared)
        */
        Route::prefix('challenges')->group(function () {
            Route::get('/solo', [ChallengeSoloController::class, 'index']);
            Route::get('/1v1',  [Challenge1v1Controller::class, 'index']);
        });

        /*
        | Matchmaking + runtime
        */
        Route::post('/matchmaking/join',   [MatchmakingController::class, 'join']);
        Route::post('/matchmaking/poll',   [MatchmakingController::class, 'poll']);
        Route::post('/matchmaking/cancel', [MatchmakingController::class, 'cancel']);

        Route::prefix('match')->group(function () {
            Route::post('/{match}/submit',    [MatchRuntimeController::class, 'submit'])->whereNumber('match');
            Route::post('/{match}/leave',     [MatchRuntimeController::class, 'leave'])->whereNumber('match');
            Route::post('/{match}/surrender', [MatchRuntimeController::class, 'surrender'])->whereNumber('match');
            Route::post('/{match}/award',     [MatchRuntimeController::class, 'award'])->whereNumber('match');
            Route::get ('/{match}/status',    [MatchRuntimeController::class, 'status'])->whereNumber('match');
        });

        /*
        | Duels (participant-only)
        */
        Route::middleware([CheckRole::class . ':participant'])->prefix('duels')->group(function () {
            Route::get('/my', [DuelController::class, 'myDuels']);
            Route::post('/', [DuelController::class, 'create']);
            Route::get('/{duel}', [DuelController::class, 'show'])->whereNumber('duel');
            Route::post('/{duel}/accept', [DuelController::class, 'accept'])->whereNumber('duel');
            Route::post('/{duel}/submit', [DuelController::class, 'submit'])->whereNumber('duel');
            Route::post('/{duel}/surrender', [DuelController::class, 'surrender'])->whereNumber('duel');
            Route::post('/{duel}/decline', [DuelController::class, 'decline'])->whereNumber('duel');
            Route::post('/{duel}/start-user-session', [DuelController::class, 'startUserSession'])->whereNumber('duel');
            Route::post('/{duel}/finalize', [DuelController::class, 'finalize'])->whereNumber('duel');

            Route::get('/stats/me', [DuelController::class, 'stats']);
        });

        /*
        | Users list for picking opponents (shared)
        */
        Route::get('/users/participants', function () {
            try {
                $participants = User::where('role', 'participant')
                    ->with(['profile:id,user_id,username,avatar_url'])
                    ->orderByDesc('total_xp')
                    ->orderByDesc('stars')
                    ->get(['id','name','email','role','stars','total_xp']);

                $data = $participants->map(function ($u) {
                    return [
                        'id'       => $u->id,
                        'name'     => $u->name,
                        'email'    => $u->email,
                        'stars'    => (int)($u->stars ?? 0),
                        'total_xp' => (float)($u->total_xp ?? 0),
                        'profile'  => [
                            'username'   => optional($u->profile)->username,
                            'avatar_url' => optional($u->profile)->avatar_url,
                        ],
                    ];
                });

                return response()->json(['success' => true, 'data' => $data]);
            } catch (\Throwable $e) {
                Log::error('participants error', ['ex' => $e->getMessage()]);
                return response()->json(['success' => false, 'message' => 'Error fetching participants'], 500);
            }
        });

        /*
        | AI Challenges
        */
        Route::middleware([CheckRole::class . ':participant'])->prefix('ai-challenges')->group(function () {
            Route::post('/generate',          [AIChallengeController::class, 'generate']);
            Route::post('/generate-multiple', [AIChallengeController::class, 'generateMultiple']);
            Route::post('/submit-attempt',    [AIChallengeController::class, 'submitAttempt']);
            Route::get('/topics',             [AIChallengeController::class, 'getTopics']);
        });

        /*
        | ADMIN-ONLY API
        */
        Route::middleware([CheckRole::class . ':admin'])->group(function () {

            // Users
            Route::prefix('users')->group(function () {
                Route::get('/', [UserController::class, 'index']);
                Route::post('/', [UserController::class, 'store']);
                Route::get('/{id}', [UserController::class, 'show'])->whereNumber('id');
                Route::put('/{id}', [UserController::class, 'update'])->whereNumber('id');
                Route::delete('/{id}', [UserController::class, 'destroy'])->whereNumber('id');
                Route::get('/role/{role}', [UserController::class, 'getByRole'])->whereIn('role', ['admin', 'participant']);
                Route::get('/stats/system', [UserController::class, 'systemStats']);
            });

            // Challenges CRUD
            Route::prefix('challenges')->group(function () {
                Route::post('/solo/import', [ChallengeSoloController::class, 'import']);
                Route::post('/1v1/import',  [Challenge1v1Controller::class, 'import']);

                Route::post('/solo',        [ChallengeSoloController::class, 'store']);
                Route::put('/solo/{id}',    [ChallengeSoloController::class, 'update'])->whereNumber('id');

                Route::post('/1v1',         [Challenge1v1Controller::class, 'store']);
                Route::put('/1v1/{id}',     [Challenge1v1Controller::class, 'update'])->whereNumber('id');

                Route::delete('/solo/{id}', [ChallengeSoloController::class, 'destroy'])->whereNumber('id');
                Route::delete('/1v1/{id}',  [Challenge1v1Controller::class, 'destroy'])->whereNumber('id');
            });

            // AI Challenge admin ops
            Route::prefix('ai-challenges')->group(function () {
                Route::post('/generate-and-save', [AIChallengeController::class, 'generateAndSave']);
            });

            // Feedbacks
            Route::prefix('feedbacks')->group(function () {
                Route::get('/', [FeedbackController::class, 'index']);
                Route::put('/{feedback}', [FeedbackController::class, 'update'])->whereNumber('feedback');
                Route::delete('/{feedback}', [FeedbackController::class, 'destroy'])->whereNumber('feedback');
            });
        });
    });

    /*
    |-------------------------
    | ADMIN PAGES
    |-------------------------
    */
    Route::middleware([CheckRole::class . ':admin'])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('/challenges', fn () => Inertia::render('Admin/Challenges'))->name('challenges');
            Route::get('/reports',    fn () => Inertia::render('Admin/Reports'))->name('reports');
            Route::get('/feedbacks',  fn () => Inertia::render('Admin/Feedbacks'))->name('feedbacks');
            Route::get('/users',      fn () => Inertia::render('Admin/Users'))->name('users');
            Route::get('/settings',   fn () => Inertia::render('Admin/Settings'))->name('settings');

            // Admin > Challenges view routes
            Route::prefix('challenges')->name('challenges.')->group(function () {
                // SOLO
                Route::get('/solo/create',                [ChallengeSoloController::class, 'create'])->name('solo.create');
                Route::get('/solo/{challenge}',           [ChallengeSoloController::class, 'show'])->whereNumber('challenge')->name('solo.show');
                Route::get('/solo/{challenge}/edit',      [ChallengeSoloController::class, 'edit'])->whereNumber('challenge')->name('solo.edit');
                Route::get('/solo/{challenge}/export',    [ChallengeSoloController::class, 'export'])->whereNumber('challenge')->name('solo.export');

                // 1v1
                Route::get('/1v1/create',                 [Challenge1v1Controller::class, 'create'])->name('1v1.create');
                Route::get('/1v1/{challenge}',            [Challenge1v1Controller::class, 'show'])->whereNumber('challenge')->name('1v1.show');
                Route::get('/1v1/{challenge}/edit',       [Challenge1v1Controller::class, 'edit'])->whereNumber('challenge')->name('1v1.edit');
                Route::get('/1v1/{challenge}/export',     [Challenge1v1Controller::class, 'export'])->whereNumber('challenge')->name('1v1.export');
            });
        });
});

/*
|--------------------------------------------------------------------------
| Auth scaffolding / settings
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
