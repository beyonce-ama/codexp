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




// Home (Welcome) Page
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// Authenticated and Verified Routes
Route::middleware(['web', 'auth', 'verified'])->group(function () {


    Route::get('/play/matchmaking', fn() => Inertia::render('Participant/Matchmaking'))->name('participant.matchmaking');
Route::get('/play/m/{slug}', [MatchRuntimeController::class, 'show'])
                ->name('match.show');

    Route::prefix('api')->group(function () {
        Route::post('/matchmaking/join',   [MatchmakingController::class, 'join']);
Route::post('/match/{match}/award', [MatchRuntimeController::class, 'award'])
    ->middleware('auth:sanctum');

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
        
        // Helper function to safely count table records
        $safeCount = function($table) {
            try {
                return DB::table($table)->count();
            } catch (Exception $e) {
                return 0;
            }
        };

        // Helper function to safely count with conditions
        $safeCountWhere = function($table, $column, $value) {
            try {
                return DB::table($table)->where($column, $value)->count();
            } catch (Exception $e) {
                return 0;
            }
        };

        // Helper function to safely count with date conditions
        $safeCountWhereDate = function($table, $column, $date) {
            try {
                return DB::table($table)->whereDate($column, $date)->count();
            } catch (Exception $e) {
                return 0;
            }
        };

        if ($user->role === 'admin') {
            // Admin dashboard stats with safe queries
            return response()->json([
                'success' => true,
                'data' => [
                    // User Statistics
                    'total_users' => $safeCount('users'),
                    'admin_users' => $safeCountWhere('users', 'role', 'admin'),
                    'participant_users' => $safeCountWhere('users', 'role', 'participant'),
                    'new_users_today' => $safeCountWhereDate('users', 'created_at', today()),
                    
                    // Challenge Statistics
                    'total_solo_challenges' => $safeCount('challenges_solo'),
                    'total_1v1_challenges' => $safeCount('challenges_1v1'),
                    'fixbugs_challenges' => $safeCountWhere('challenges_solo', 'mode', 'fixbugs'),
                    'random_challenges' => $safeCountWhere('challenges_solo', 'mode', 'random'),
                    'ai_generated_challenges' => $safeCountWhere('challenges_solo', 'mode', 'ai_generated'),
                    
                    // Activity Statistics
                    'total_solo_attempts' => $safeCount('solo_attempts'),
                    'successful_solo_attempts' => $safeCountWhere('solo_attempts', 'is_correct', true),
                    'total_duels' => $safeCount('duels'),
                    'completed_duels' => $safeCountWhere('duels', 'status', 'finished'),
                    'pending_duels' => $safeCountWhere('duels', 'status', 'pending'),
                    
                    // Today's Activity
                    'solo_attempts_today' => $safeCountWhereDate('solo_attempts', 'created_at', today()),
                    'duels_today' => $safeCountWhereDate('duels', 'created_at', today()),
                    
                    // Feedback Statistics (with safe handling)
                    'total_feedbacks' => $safeCount('feedbacks'),
                    'open_feedbacks' => $safeCountWhere('feedbacks', 'status', 'open'),
                    'resolved_feedbacks' => $safeCountWhere('feedbacks', 'status', 'resolved'),
                    
                    // Language Statistics
                    'python_attempts' => $safeCountWhere('solo_attempts', 'language', 'python'),
                    'java_attempts' => $safeCountWhere('solo_attempts', 'language', 'java'),
                    
                    // Characters
                    'total_characters' => $safeCount('characters'),
                ]
            ]);
        } else {
            // Participant dashboard stats with safe queries
            $userId = $user->id;
            
            return response()->json([
                'success' => true,
                'data' => [
                    // Personal Statistics
                    'solo_attempts' => $safeCountWhere('solo_attempts', 'user_id', $userId),
                    'successful_attempts' => (function() use ($userId) {
                        try {
                            return DB::table('solo_attempts')
                                ->where('user_id', $userId)
                                ->where('is_correct', true)
                                ->count();
                        } catch (Exception $e) {
                            return 0;
                        }
                    })(),
                    'total_xp' => (function() use ($userId) {
                        try {
                            return (float) DB::table('solo_attempts')
                                ->where('user_id', $userId)
                                ->sum('xp_earned') ?: 0;
                        } catch (Exception $e) {
                            return 0;
                        }
                    })(),
                    'total_stars' => (function() use ($userId) {
                        try {
                            return (int) DB::table('solo_attempts')
                                ->where('user_id', $userId)
                                ->sum('stars_earned') ?: 0;
                        } catch (Exception $e) {
                            return 0;
                        }
                    })(),
                    
                    // Duel Statistics
                    'duels_played' => (function() use ($userId) {
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
                    'duels_as_opponent' => $safeCountWhere('duels', 'opponent_id', $userId),
                    
                    // Default values for missing data
                    'language_stats' => [],
                    'recent_solo_attempts' => [],
                    'recent_duels' => [],
                    'attempts_today' => (function() use ($userId) {
                        try {
                            return DB::table('solo_attempts')
                                ->where('user_id', $userId)
                                ->whereDate('created_at', today())
                                ->count();
                        } catch (Exception $e) {
                            return 0;
                        }
                    })(),
                    'duels_today' => (function() use ($userId) {
                        try {
                            return DB::table('duels')
                                ->where(function($query) use ($userId) {
                                    $query->where('challenger_id', $userId)
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
        }
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
    Route::post('/api/ai-challenges/submit-attempt', [AIChallengeController::class, 'submitAttempt']);
    // Get participants for duels (accessible to all authenticated users)
    Route::get('/api/users/participants', function () {
    try {
        $participants = User::where('role', 'participant')
            ->with(['profile:id,user_id,username,avatar_url'])
            ->orderByDesc('total_xp')       // sort for leaderboard
            ->orderByDesc('stars')          // tie-breaker
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


// Auth routes
require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';