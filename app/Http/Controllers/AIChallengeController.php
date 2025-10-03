<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChallengeSolo;
use App\Services\AzureOpenAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\SoloAttempt;
use Illuminate\Support\Arr;

class AIChallengeController extends Controller
{
    private $openAIService;

    public function __construct(AzureOpenAIService $openAIService)
    {
        $this->openAIService = $openAIService;
    }

    /**
     * Generate a single AI challenge
     */
    public function generate(Request $request)
    {
        $data = $request->validate([
            'language'   => 'required|in:python,java,cpp',
            'difficulty' => 'required|in:easy,medium,hard',
            'topic'      => 'sometimes|string|max:100',
        ]);

        try {
            $challenge = $this->openAIService->generateChallenge(
                $data['language'],
                $data['difficulty'],
                $data['topic'] ?? null
            );

            return response()->json([
                'success' => true,
                'data'    => $challenge
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate AI challenge', [
                'error' => $e->getMessage(),
                'data'  => $data
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate challenge. Please try again.'
            ], 500);
        }
    }

    public function submitAttempt(Request $request)
    {
        $data = $request->validate([
            'language'       => 'required|in:python,java,cpp',
            'difficulty'     => 'required|in:easy,medium,hard',
            'is_correct'     => 'required|boolean',
            'hint_used'      => 'sometimes|boolean',
            'time_spent_sec' => 'sometimes|integer|min:0',
            'code_submitted' => 'sometimes|string',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $hintUsed = (bool)($data['hint_used'] ?? false);

        // Server-authoritative XP: only when correct; honors hint penalty
        $xp = $data['is_correct']
            ? $this->calculateRewardXP($data['difficulty'], $hintUsed)
            : 0.0;

        DB::transaction(function () use ($user, $data, $xp) {
            $user->increment('ai_attempts', 1);

            if ($data['is_correct'] && $xp > 0) {
                $user->increment('ai_successful_attempts', 1);
                $user->increment('total_xp', $xp);
            }
        });

        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => $data['is_correct'] ? 'Rewards applied!' : 'Attempt recorded (no reward).',
            'data' => [
                'xp_earned' => (float)$xp,
                'total_xp'  => (float)($user->total_xp),
                'ai_successful_attempts' => (int)($user->ai_successful_attempts),
                'ai_attempts'            => (int)($user->ai_attempts),
            ],
        ]);
    }

    /**
     * Generate multiple AI challenges
     */
    public function generateMultiple(Request $request)
    {
        $data = $request->validate([
            'language'   => 'required|in:python,java,cpp',
            'difficulty' => 'required|in:easy,medium,hard',
            'count'      => 'sometimes|integer|min:1|max:5'
        ]);

        try {
            $challenges = $this->openAIService->generateMultipleChallenges(
                $data['language'],
                $data['difficulty'],
                $data['count'] ?? 3
            );

            return response()->json([
                'success' => true,
                'data'    => $challenges
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate multiple AI challenges', [
                'error' => $e->getMessage(),
                'data'  => $data
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate challenges. Please try again.'
            ], 500);
        }
    }

    /**
     * Generate and save AI challenge to database
     */
    public function generateAndSave(Request $request)
    {
        $data = $request->validate([
            'language'   => 'required|in:python,java,cpp',
            'difficulty' => 'required|in:easy,medium,hard',
            'topic'      => 'sometimes|string|max:100',
            'save_to_db' => 'sometimes|boolean'
        ]);

        try {
            $challengeData = $this->openAIService->generateChallenge(
                $data['language'],
                $data['difficulty'],
                $data['topic'] ?? null
            );

            $response = ['success' => true, 'data' => $challengeData];

            if ($data['save_to_db'] ?? false) {
                $challenge = ChallengeSolo::create([
                    'mode'         => 'ai_generated',          // ensure enum allows this
                    'language'     => $data['language'],
                    'difficulty'   => $data['difficulty'],
                    'title'        => $challengeData['title'],
                    'description'  => $challengeData['description'],
                    'buggy_code'   => $challengeData['buggy_code'],
                    'fixed_code'   => $challengeData['fixed_code'],
                    'hint'         => $challengeData['hint'],
                    'payload_json' => $challengeData,
                    'source_file'  => 'ai_generated',
                    'reward_xp'    => $this->calculateRewardXP($data['difficulty']),
                ]);

                $response['saved_challenge'] = $challenge;
                $response['message'] = 'Challenge generated and saved successfully!';
            }

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Failed to generate and save AI challenge', [
                'error' => $e->getMessage(),
                'data'  => $data
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate challenge. Please try again.'
            ], 500);
        }
    }

    /**
     * Get available topics for a language
     */
    public function getTopics(Request $request)
    {
        $language = $request->validate([
            'language' => 'required|in:python,java,cpp'
        ])['language'];

        $commonTopics = [
            'Arrays & Lists', 'Loops & Iteration', 'Functions', 'Conditionals',
            'String Manipulation', 'Data Validation', 'Sorting', 'Searching',
            'Recursion', 'Basic Algorithms'
        ];

        $languageSpecific = [
            'python' => [
                'List Comprehensions', 'Dictionaries', 'Exception Handling',
                'File Handling', 'Classes & Objects', 'Decorators', 'Lambda Functions'
            ],
            'java' => [
                'Collections', 'Inheritance', 'Interfaces', 'Exception Handling',
                'Generics', 'Streams', 'Object-Oriented Programming', 'Abstract Classes'
            ],
            'cpp' => [
                'Pointers & References', 'STL Vectors/Maps', 'RAII & Memory Management',
                'Classes & Inheritance', 'Templates', 'Standard Algorithms',
                'I/O Streams', 'Move Semantics'
            ],
        ];

        $topics = array_merge($commonTopics, $languageSpecific[$language] ?? []);

        return response()->json([
            'success' => true,
            'data'    => $topics
        ]);
    }

    private function calculateRewardXP(string $difficulty, bool $hintUsed = false): float
    {
        $base = match ($difficulty) {
            'easy'   => 3.0,
            'medium' => 4.0,
            'hard'   => 6.0,
            default  => 3.0
        };

        return $hintUsed ? $base - 0.5 : $base;
    }
}
