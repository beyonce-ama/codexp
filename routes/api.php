<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\ChallengeSoloController;
use App\Http\Controllers\Challenge1v1Controller;
use App\Http\Controllers\SoloAttemptController;
use App\Http\Controllers\DuelController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AIChallengeController;
use App\Http\Controllers\MatchmakingController;
use Illuminate\Http\Request; 
use App\Http\Controllers\MatchplayController;


// Middleware
use App\Http\Middleware\CheckRole;

// ========== PING ==========
Route::get('/ping', fn() => response()->json(['ok' => true]));

// ========== AUTH PROTECTED API ==========
Route::middleware(['auth:sanctum'])->group(function () {

    // ====================
    // ADMIN ROUTES
    // ====================
    Route::middleware([CheckRole::class . ':admin'])->group(function () {

        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::get('{id}', [UserController::class, 'show'])->whereNumber('id');
            Route::put('{id}', [UserController::class, 'update'])->whereNumber('id');
            Route::delete('{id}', [UserController::class, 'destroy'])->whereNumber('id');
            Route::get('role/{role}', [UserController::class, 'getByRole'])->whereIn('role', ['admin', 'participant']);
            Route::get('stats/system', [UserController::class, 'systemStats']);
        });

        Route::prefix('challenges')->group(function () {
            Route::post('solo/import', [ChallengeSoloController::class, 'import']);
            Route::post('1v1/import', [Challenge1v1Controller::class, 'import']);
            Route::delete('solo/{id}', [ChallengeSoloController::class, 'destroy'])->whereNumber('id');
            Route::delete('1v1/{id}', [Challenge1v1Controller::class, 'destroy'])->whereNumber('id');
        });
        Route::get('/solo', [ChallengeSoloController::class, 'index']);
        Route::delete('/solo/{challenge}', [ChallengeSoloController::class, 'destroy']);
        Route::post('/solo/import', [ChallengeSoloController::class, 'import']);

        // 1v1 list/delete/import
        Route::get('/1v1', [Challenge1v1Controller::class, 'index']);
        Route::delete('/1v1/{challenge}', [Challenge1v1Controller::class, 'destroy']);
        Route::post('/1v1/import', [Challenge1v1Controller::class, 'import']);
        Route::prefix('characters')->group(function () {
            Route::post('/', [CharacterController::class, 'store']);
            Route::put('{id}', [CharacterController::class, 'update'])->whereNumber('id');
            Route::delete('{id}', [CharacterController::class, 'destroy'])->whereNumber('id');
        });

        Route::prefix('feedbacks')->group(function () {
            Route::put('{feedback}', [FeedbackController::class, 'update'])->whereNumber('feedback');
            Route::delete('{feedback}', [FeedbackController::class, 'destroy'])->whereNumber('feedback');
        });

        // AI Challenge management (ADMIN ONLY)
        Route::prefix('ai-challenges')->group(function () {
            Route::post('generate-and-save', [AIChallengeController::class, 'generateAndSave']);
        });
    });

    // ====================
    // PARTICIPANT ROUTES
    // ====================
    Route::middleware([CheckRole::class . ':participant'])->group(function () {
        // Solo attempts
        Route::post('solo/attempts', [SoloAttemptController::class, 'store']);

        // Duel routes
        Route::prefix('duels')->group(function () {
            Route::get('my', [DuelController::class, 'myDuels']);
            Route::post('/', [DuelController::class, 'create']);
            Route::get('{duel}', [DuelController::class, 'show'])->whereNumber('duel');
            Route::post('{duel}/accept', [DuelController::class, 'accept'])->whereNumber('duel');
            Route::post('{duel}/submit', [DuelController::class, 'submit'])->whereNumber('duel');
            Route::post('{duel}/surrender', [DuelController::class, 'surrender'])->whereNumber('duel');
            Route::get('stats/me', [DuelController::class, 'stats']);
        });

    });

    // ====================
    // SHARED ROUTES
    // ====================
    Route::prefix('me')->group(function () {
        Route::get('/', [ProfileController::class, 'me']);
        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::get('stats', [StatsController::class, 'me']);
    });
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/matchmaking/join', [MatchmakingController::class, 'join']);
        Route::post('/matchmaking/cancel', [MatchmakingController::class, 'cancel']);
        Route::post('/match/{match}/ready', [MatchplayController::class, 'markReady']); // optional
        Route::post('/match/{match}/submit', [MatchplayController::class, 'submit']);
        Route::post('/match/{match}/surrender', [MatchplayController::class, 'surrender']);
         Route::post('/match/{match}/leave',  [MatchRuntimeController::class, 'leave']);
    Route::get ('/match/{match}/status', [MatchRuntimeController::class, 'status']); 
    });

    Route::prefix('challenges')->group(function () {
        Route::get('solo', [ChallengeSoloController::class, 'index']);
        Route::get('1v1', [Challenge1v1Controller::class, 'index']);
    });

    Route::prefix('ai-challenges')->group(function () {
        Route::post('generate', [AIChallengeController::class, 'generate']);
        Route::post('generate-multiple', [AIChallengeController::class, 'generateMultiple']);
        Route::post('submit-attempt', [AIChallengeController::class, 'submitAttempt']); // ✅ MOVE HERE
        Route::get('topics', [AIChallengeController::class, 'getTopics']);
    });
    Route::get('characters', [CharacterController::class, 'index']);

    Route::prefix('feedbacks')->group(function () {
        Route::get('/', [FeedbackController::class, 'index']);
        Route::post('/', [FeedbackController::class, 'store']);
    });

    // Get participants for duels
    Route::get('users/participants', function() {
        try {
            $participants = \App\Models\User::where('role', 'participant')
                ->with('profile')
                ->get();
            return response()->json(['success' => true, 'data' => $participants]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error fetching participants']);
        }
    });
});

Route::middleware('auth')->group(function () {
  // DB-backed queue & pairing
  Route::post('/matchmaking/join',   [MatchmakingController::class, 'join']);
  Route::post('/matchmaking/poll',   [MatchmakingController::class, 'poll']);
  Route::post('/matchmaking/cancel', [MatchmakingController::class, 'cancel']);

  // Runtime actions
  Route::post('/match/{matchId}/ready',  [MatchRuntimeController::class, 'ready']);
  Route::post('/match/{matchId}/submit', [MatchRuntimeController::class, 'submit']);
});

// ========== FALLBACK ==========
Route::fallback(fn () => response()->json([
    'ok' => false,
    'message' => 'Endpoint not found'
], 404));