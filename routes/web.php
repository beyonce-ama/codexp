<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Http\Request;
// Import Controllers with specific aliases to avoid conflicts
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
use App\Http\Controllers\PracticeController;


// Home (Welcome) Page
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// Authenticated and Verified Routes
Route::middleware(['web', 'auth', 'verified'])->group(function () {

        Route::get('/play/matchmaking', fn() => Inertia::render('Participant/Matchmaking'))->name('participant.matchmaking');
        Route::get('/play/m/{slug}', [MatchRuntimeController::class, 'show'])
                        ->name('match.show');

        Route::prefix('api')->group(function () {
Route::get('/1v1', [Challenge1v1Controller::class, 'index']);

        Route::post('/solo/attempts',   [SoloUsageController::class, 'storeAttempt']);
        Route::post('/solo/mark-taken', [SoloUsageController::class, 'markTaken']);
        Route::get('/solo/taken',       [SoloUsageController::class, 'listTaken']);

        Route::get('/achievements/progress', [\App\Http\Controllers\AchievementController::class, 'progress']);
        Route::post('/achievements/claim',    [\App\Http\Controllers\AchievementController::class, 'claim']);
        Route::post('/matchmaking/join',   [MatchmakingController::class, 'join']);
        Route::post('/match/{match}/award', [MatchRuntimeController::class, 'award'])
            ->middleware('auth:sanctum');
        
        Route::get('/matchmaking/history', [MatchmakingController::class, 'history']);
        Route::post('/match/{match}/surrender', [MatchRuntimeController::class, 'surrender']);
        Route::post('/matchmaking/poll',   [MatchmakingController::class, 'poll']);
        Route::post('/matchmaking/cancel', [MatchmakingController::class, 'cancel']);
         Route::post('/match/{match}/submit', [MatchRuntimeController::class, 'submit'])
         ->whereNumber('match');
         Route::post('/match/{match}/leave', [MatchRuntimeController::class, 'leave']);
        Route::get ('/match/{match}/status', [MatchRuntimeController::class, 'status']); 
        });
        Route::get('/play/match/{matchId}', [MatchRuntimeController::class, 'show'])->whereNumber('matchId');

        // Dashboard with role-based rendering
        Route::get('/dashboard', function () {
            return match (Auth::user()->role ?? 'participant') {
                'admin' => Inertia::render('Admin/Dashboard'),
                'participant' => Inertia::render('Participant/Dashboard'),
                default => Inertia::render('Participant/Dashboard'),
            };
                })->name('dashboard');
        // Dashboard stats API endpoint with error handling


Route::get('/dashboard/stats', function () {
   $user = auth()->user();

    // Helpers
    $safeCount = function ($table) {
        try {
            return DB::table($table)->count();
        } catch (Exception $e) {
            return 0;
        }
    };

    $safeCountWhere = function ($table, $column, $value) {
        try {
            return DB::table($table)->where($column, $value)->count();
        } catch (Exception $e) {
            return 0;
        }
    };

    $safeCountWhereDate = function ($table, $column, $date) {
        try {
            return DB::table($table)->whereDate($column, $date)->count();
        } catch (Exception $e) {
            return 0;
        }
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
                'solo_cpp_challenges'     => $safeCountWhere('challenges_solo', 'language', 'cpp'), // NEW
                'solo_easy'   => $safeCountWhere('challenges_solo', 'difficulty', 'easy'),
                'solo_medium' => $safeCountWhere('challenges_solo', 'difficulty', 'medium'),
                'solo_hard'   => $safeCountWhere('challenges_solo', 'difficulty', 'hard'),

                // --- 1v1 Challenge Stats ---
                'total_1v1_challenges'   => $safeCount('challenges_1v1'),
                'duel_python_challenges' => $safeCountWhere('challenges_1v1', 'language', 'python'),
                'duel_java_challenges'   => $safeCountWhere('challenges_1v1', 'language', 'java'),
                'duel_cpp_challenges'    => $safeCountWhere('challenges_1v1', 'language', 'cpp'), // NEW
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
                'cpp_attempts'    => DB::table('solo_taken')->where('language','cpp')->count()   // NEW
                                  + DB::table('duels_taken')->where('language','cpp')->count(), // NEW

                // --- Feedback ---
                'total_feedbacks'   => $safeCount('feedback'),
                'open_feedbacks'    => $safeCountWhere('feedback', 'status', 'open'),
                'resolved_feedbacks'=> $safeCountWhere('feedback', 'status', 'resolved'),

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
                } catch (Exception $e) {
                    return 0;
                }
            })(),
            'total_xp' => (function () use ($userId) {
                try {
                    return (float) DB::table('solo_attempts')
                        ->where('user_id', $userId)
                        ->sum('xp_earned') ?: 0;
                } catch (Exception $e) {
                    return 0;
                }
            })(),
            'total_stars' => (function () use ($userId) {
                try {
                    return (int) DB::table('solo_attempts')
                        ->where('user_id', $userId)
                        ->sum('stars_earned') ?: 0;
                } catch (Exception $e) {
                    return 0;
                }
            })(),
            'duels_played' => (function () use ($userId) {
                try {
                    return DB::table('duels')
                        ->where('challenger_id', $userId)
                        ->orWhere('opponent_id', $userId)
                        ->count();
                } catch (Exception $e) {
                    return 0;
                }
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
                } catch (Exception $e) {
                    return 0;
                }
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
                } catch (Exception $e) {
                    return 0;
                }
            })(),
        ]
    ]);
})->name('dashboard.stats');


    // ====================
    // ADMIN API ROUTES (VIA WEB)
    // ====================
        
        // Test route
        Route::get('/api/test', function () {
            return response()->json([
                'success' => true,
                'user' => auth()->user(),
                'message' => 'API is working via web routes'
            ]);
        });

    // Admin API routes
        Route::middleware([CheckRole::class . ':admin'])->group(function () {
            
            // User management routes
            Route::prefix('api/users')->group(function () {
                Route::get('/', [UserController::class, 'index']);
                Route::post('/', [UserController::class, 'store']);
                Route::get('/{id}', [UserController::class, 'show'])->whereNumber('id');
                Route::put('/{id}', [UserController::class, 'update'])->whereNumber('id');
                Route::delete('/{id}', [UserController::class, 'destroy'])->whereNumber('id');
                Route::get('/role/{role}', [UserController::class, 'getByRole'])->whereIn('role', ['admin', 'participant']);
                Route::get('/stats/system', [UserController::class, 'systemStats']);
            });

            // Challenge management routes
            Route::prefix('api/challenges')->group(function () {
                // Read routes
                Route::get('/solo', [ChallengeSoloController::class, 'index']);
                Route::get('/1v1', [Challenge1v1Controller::class, 'index']);
                
                // Import routes (ADMIN ONLY)
                Route::post('/solo/import', [ChallengeSoloController::class, 'import']);
                Route::post('/1v1/import', [Challenge1v1Controller::class, 'import']);
                // SOLO challenge create + update
                Route::post('/solo', [ChallengeSoloController::class, 'store']);
                Route::put('/solo/{id}', [ChallengeSoloController::class, 'update'])->whereNumber('id');

                // 1v1 challenge create + update
                Route::post('/1v1', [Challenge1v1Controller::class, 'store']);
                Route::put('/1v1/{id}', [Challenge1v1Controller::class, 'update'])->whereNumber('id');

                // Delete routes
                Route::delete('/solo/{id}', [ChallengeSoloController::class, 'destroy'])->whereNumber('id');
                Route::delete('/1v1/{id}', [Challenge1v1Controller::class, 'destroy'])->whereNumber('id');
            });

            // AI Challenge management routes (ADMIN ONLY)
            Route::prefix('api/ai-challenges')->group(function () {
                Route::post('/generate-and-save', [AIChallengeController::class, 'generateAndSave']);
            });

            // Feedback management routes
            Route::prefix('api/feedbacks')->group(function () {
                Route::get('/', [FeedbackController::class, 'index']);
                Route::put('/{feedback}', [FeedbackController::class, 'update'])->whereNumber('feedback');
                Route::delete('/{feedback}', [FeedbackController::class, 'destroy'])->whereNumber('feedback');
            });

        

        });

    // ====================
    // PARTICIPANT API ROUTES (VIA WEB)
    // ====================


    Route::middleware([CheckRole::class . ':participant'])->group(function () {
        // Solo attempts
        Route::post('/api/solo/attempts', [SoloAttemptController::class, 'store']);
        
        // Duel routes
        Route::prefix('api/duels')->group(function () {
            Route::get('/my', [DuelController::class, 'myDuels']);
            Route::post('/', [DuelController::class, 'create']);
            Route::get('/{duel}', [DuelController::class, 'show'])->whereNumber('duel');
            Route::post('/{duel}/accept', [DuelController::class, 'accept'])->whereNumber('duel');
            Route::post('/{duel}/submit', [DuelController::class, 'submit'])->whereNumber('duel');
            Route::post('/{duel}/surrender', [DuelController::class, 'surrender'])->whereNumber('duel');
            Route::post('/{duel}/decline', [DuelController::class, 'decline'])->whereNumber('duel');
            Route::post('/{duel}/start-user-session', [DuelController::class, 'startUserSession'])->whereNumber('duel');
            Route::post('/{duel}/finalize', [DuelController::class, 'finalize'])->whereNumber('duel');

            });
        
        // Duel stats endpoint
        Route::get('/api/duels/stats/me', [DuelController::class, 'stats']);

        // AI Challenge routes for participants
        Route::prefix('api/ai-challenges')->group(function () {
            Route::post('/generate', [AIChallengeController::class, 'generate']);
            Route::post('/generate-multiple', [AIChallengeController::class, 'generateMultiple']);
            Route::post('/api/ai-challenges/submit-attempt', [AIChallengeController::class, 'submitAttempt']);
            Route::get('/topics', [AIChallengeController::class, 'getTopics']);
        });
    });

    // ====================
    // SHARED API ROUTES (VIA WEB)
    // ====================
    // Leaderboard (users table only)

    // These routes are accessible to all authenticated users
    Route::prefix('api/challenges')->group(function () {
        Route::get('/solo', [ChallengeSoloController::class, 'index']);
        Route::get('/1v1', [Challenge1v1Controller::class, 'index']);
    });

    // User stats and profile routes
    Route::prefix('api/me')->group(function () {
        Route::get('/', [ProfileController::class, 'me']);
        Route::get('/stats', [StatsController::class, 'me']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
    });
       Route::match(['POST','PATCH'], '/me/preferences', [\App\Http\Controllers\PreferencesController::class, 'update'])
    ->name('me.preferences.update');

    Route::post('/api/ai-challenges/submit-attempt', [AIChallengeController::class, 'submitAttempt']);
    // Get participants for duels (accessible to all authenticated users)
   Route::get('/api/users/participants', function () {
    try {
        $participants = User::where('role', 'participant')
            ->orderByDesc('total_xp')
            ->orderByDesc('stars')
            ->get(['id','name','email','stars','total_xp','avatar']); // <-- include avatar

        $data = $participants->map(function (User $u) {
            // Normalize to a browser-usable URL
            $avatar = $u->avatar; // e.g. 'avatars/girl1.png'
            if ($avatar) {
                if (preg_match('#^(https?://|data:)#i', $avatar)) {
                    // already absolute
                } else {
                    // If stored under public/avatars/* => asset('avatars/..')
                    // If stored under storage/app/public/avatars/* => asset('storage/avatars/..') + run "php artisan storage:link"
                    $avatar = asset($avatar); // adjust to asset('storage/'.$avatar) if needed
                }
            } else {
                $avatar = null;
            }

            return [
                'id'       => $u->id,
                'name'     => $u->name,
                'email'    => $u->email,
                'stars'    => (int)($u->stars ?? 0),
                'total_xp' => (float)($u->total_xp ?? 0),
                'avatar'   => $avatar, // <-- RETURN IT
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    } catch (\Throwable $e) {
        Log::error('participants error', ['ex' => $e->getMessage()]);
        return response()->json(['success' => false, 'message' => 'Error fetching participants'], 500);
    }
});
// Solo tracking routes

    /**
     * ADMIN PAGES
     */
    Route::middleware([CheckRole::class . ':admin'])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('/challenges', fn () => Inertia::render('Admin/Challenges'))->name('challenges');
            Route::get('/reports', fn () => Inertia::render('Admin/Reports'))->name('reports');
            Route::get('/feedbacks', fn () => Inertia::render('Admin/Feedbacks'))->name('feedbacks');
            Route::get('/users', fn () => Inertia::render('Admin/Users'))->name('users');
            Route::get('/settings', fn () => Inertia::render('Admin/Settings'))->name('settings');
             // Admin > Challenges subroutes used by your TSX buttons
                        // Subroutes used by the Admin/Challenges.tsx buttons
        Route::prefix('challenges')->name('challenges.')->group(function () {
// Solo
        Route::post('/api/challenges/solo', [ChallengeSoloController::class, 'store']);
        Route::put('/api/challenges/solo/{id}', [ChallengeSoloController::class, 'update'])->whereNumber('id');

        // 1v1
        Route::post('/api/challenges/1v1', [Challenge1v1Controller::class, 'store']);
        Route::put('/api/challenges/1v1/{id}', [Challenge1v1Controller::class, 'update'])->whereNumber('id');

            // SOLO
            Route::get('/solo/create', [ChallengeSoloController::class, 'create'])
                ->name('solo.create');
            Route::get('/solo/{challenge}', [ChallengeSoloController::class, 'show'])
                ->whereNumber('challenge')
                ->name('solo.show');
            Route::get('/solo/{challenge}/edit', [ChallengeSoloController::class, 'edit'])
                ->whereNumber('challenge')
                ->name('solo.edit');
            Route::get('/solo/{challenge}/export', [ChallengeSoloController::class, 'export'])
                ->whereNumber('challenge')
                ->name('solo.export');

            // 1v1
            Route::get('/1v1/create', [Challenge1v1Controller::class, 'create'])
                ->name('1v1.create');
            Route::get('/1v1/{challenge}', [Challenge1v1Controller::class, 'show'])
                ->whereNumber('challenge')
                ->name('1v1.show');
            Route::get('/1v1/{challenge}/edit', [Challenge1v1Controller::class, 'edit'])
                ->whereNumber('challenge')
                ->name('1v1.edit');
            Route::get('/1v1/{challenge}/export', [Challenge1v1Controller::class, 'export'])
                ->whereNumber('challenge')
                ->name('1v1.export');
        });

        });

    /**
     * PARTICIPANT PAGES
     */
    Route::middleware([CheckRole::class . ':participant'])->group(function () {
        Route::get('/play/solo', fn () => Inertia::render('Participant/Solo'))->name('participant.solo');
        Route::get('/play/ai-challenges', fn () => Inertia::render('Participant/AIChallenges'))->name('participant.ai-challenges');
        Route::get('/play/practice', fn () => Inertia::render('Participant/Practice'))->name('participant.practice');
        Route::get('/play/duel', fn () => Inertia::render('Participant/Duel'))->name('participant.duel');
        Route::get('/play/Matchmaking', fn () => Inertia::render('Participant/Matchmaking'))->name('participant.matchmaking');
        Route::get('/profile', fn () => Inertia::render('Participant/Profile'))->name('participant.profile');
    });
   
    /**
     * SHARED PAGES
     */
    Route::get('/faq', fn () => Inertia::render('System/FAQ'))->name('system.faq');
});

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});
Route::middleware(['auth'])->group(function () {
    // Practice routes
    Route::get('/practice/current', [PracticeController::class, 'current'])->name('practice.current');
    Route::post('/practice/taken', [PracticeController::class, 'markTaken'])->name('practice.taken');
    Route::post('/practice/finish', [PracticeController::class, 'finishSet'])->name('practice.finish');
    Route::get('/practice/sets', [PracticeController::class, 'listSets'])->name('practice.sets');
});


// Auth routes
require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';