<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AzureOpenAIService
{
    private $endpoint;
    private $apiKey;
    private $deploymentName;
    private $apiVersion;
    private $maxTokens;
    private $temperature;

    public function __construct()
    {
        $this->endpoint       = rtrim(config('azure.openai.endpoint'), '/');
        $this->apiKey         = config('azure.openai.api_key');
        $this->deploymentName = config('azure.openai.deployment_name');
        $this->apiVersion     = config('azure.openai.api_version');
        $this->maxTokens      = config('azure.openai.max_tokens', 1000);
        $this->temperature    = config('azure.openai.temperature', 0.7);
    }
    private function languageLabel(string $lang): string
{
    return match (strtolower($lang)) {
        'cpp'   => 'C++',
        'java'  => 'Java',
        'python'=> 'Python',
        default => ucfirst($lang),
    };
}
    /**
     * Generate one challenge. If $topic is null, we auto-pick a topic and avoid repeating
     * the most recently used topic for that language for ~30 minutes.
     */
    public function generateChallenge(string $language, string $difficulty, string $topic = null): array
    {
        // Avoid immediate repeats per language (best-effort; cache optional)
        $avoid = [];
        try {
            $recent = cache()->get("ai:last_topic:$language");
            if (is_string($recent) && $recent !== '') {
                $avoid[] = $recent;
            }
        } catch (\Throwable $e) {
            // cache not critical
        }

        if ($topic === null) {
            $topic = $this->pickRandomTopic($language, $avoid);
        }

        // Remember the chosen topic to reduce repetition
        try {
            cache()->put("ai:last_topic:$language", $topic, now()->addMinutes(30));
        } catch (\Throwable $e) {
            // cache not critical
        }

        $prompt = $this->buildChallengePrompt($language, $difficulty, $topic);

        // Tiny invisible salt to nudge variety without changing semantics
        try {
            $salt = bin2hex(random_bytes(4)); // 8 hex chars
            $prompt .= "\n\n#VARIETY_SALT={$salt}";
        } catch (\Throwable $e) {
            // non-fatal
        }

        try {
            $response = Http::withHeaders([
                'api-key'      => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post(
                "{$this->endpoint}/openai/deployments/{$this->deploymentName}/chat/completions?api-version={$this->apiVersion}",
                [
                    'messages' => [
                        [
                            'role'    => 'system',
                            'content' => 'You are an expert programming instructor who creates coding challenges. Always respond with valid JSON format containing the required fields.'
                        ],
                        [
                            'role'    => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'max_tokens'        => $this->maxTokens,
                    'temperature'       => $this->temperature,
                    'top_p'             => 0.95,
                    'frequency_penalty' => 0,
                    'presence_penalty'  => 0, // feel free to make this 0.6 in config if you want more variety globally
                ]
            );

            if (!$response->successful()) {
                Log::error('Azure OpenAI API Error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                throw new \Exception('Failed to generate challenge: API request failed');
            }

            $data = $response->json();

            if (!isset($data['choices'][0]['message']['content'])) {
                throw new \Exception('Invalid response format from Azure OpenAI');
            }

            $content = trim($data['choices'][0]['message']['content']);

            // Try to extract JSON from the response (in case there's extra text)
            $jsonStart = strpos($content, '{');
            $jsonEnd   = strrpos($content, '}');

            if ($jsonStart !== false && $jsonEnd !== false) {
                $content = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
            }

            $challengeData = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Failed to parse JSON from OpenAI response', [
                    'content'    => $content,
                    'json_error' => json_last_error_msg(),
                ]);
                throw new \Exception('Invalid JSON response from AI service');
            }

            // Validate required fields
            $requiredFields = ['title', 'description', 'buggy_code', 'fixed_code', 'hint'];
            foreach ($requiredFields as $field) {
                if (!isset($challengeData[$field])) {
                    throw new \Exception("Missing required field: {$field}");
                }
            }

            return $challengeData;

        } catch (\Exception $e) {
            Log::error('Error generating challenge with Azure OpenAI', [
                'error'      => $e->getMessage(),
                'language'   => $language,
                'difficulty' => $difficulty,
                'topic'      => $topic,
            ]);
            throw $e;
        }
    }

    /**
     * Stronger prompt: forces the chosen topic and varies real-world scenarios.
     */
    private function buildChallengePrompt(string $language, string $difficulty, string $topic = null): string
    {
        $topicText = $topic
            ? "STRICTLY focused on the topic: {$topic}. Do not switch topics."
            : "on any programming concept (vary scenarios to avoid repetition).";

        $difficultyGuide = [
            'easy'   => 'Basic syntax, simple logic, beginner-friendly concepts',
            'medium' => 'Intermediate algorithms, data structures, moderate complexity',
            'hard'   => 'Advanced algorithms, complex logic, optimization challenges',
        ];

        $guide = $difficultyGuide[$difficulty] ?? 'Mixed difficulty';

         $cppHints = '';
                if (strtolower($language) === 'cpp') {
                    $cppHints = <<<CPP
            - Prefer standard library (STL): use std::vector, std::string, std::map, algorithms, iterators where appropriate
            - Make it compile & run (include necessary headers, avoid non-standard extensions)
            - Demonstrate typical C++ pitfalls (off-by-one with iterators, wrong comparator, missing const, copy vs reference, etc.)
            CPP;
                }

        return "Generate a {$difficulty} level {$language} programming challenge {$topicText}.

Guidelines:
- Difficulty: {$guide}
- The challenge must revolve around the specified topic (if given), and use a distinct real-world scenario (e.g., finance, scheduling, inventory, games, logs, analytics) to reduce repetition
- The code must contain 2–3 intentional bugs that students need to fix
- Include a clear description and a helpful hint
- Keep solutions concise and idiomatic for {$language}

Respond with ONLY a JSON object in this exact format:
{
    \"title\": \"Challenge title (max 100 chars)\",
    \"description\": \"Detailed problem description explaining what the code should do and what's wrong\",
    \"buggy_code\": \"{$language} code with 2-3 intentional bugs\",
    \"fixed_code\": \"The same code with bugs fixed\",
    \"hint\": \"Helpful hint about what to look for or how to approach the problem\"
}

Make sure:
1. The buggy_code actually has logical bugs (off-by-one, wrong operator, mutated state, wrong data structure, etc.)
2. The fixed_code is the corrected version that passes the intended behavior
3. The description explains the intended functionality and the chosen real-world scenario
4. The hint guides students without giving away the answer
5. All JSON strings are properly escaped
6. Code is realistic, runnable, and educational";
    }

    /**
     * Generate N challenges with randomized topics.
     * Unchanged external behavior—still uses explicit per-call topics.
     */
    public function generateMultipleChallenges(string $language, string $difficulty, int $count = 3): array
    {
        $challenges = [];
        $topics     = $this->getTopicsForLanguage($language);

        for ($i = 0; $i < $count; $i++) {
            try {
                $topic      = $topics[array_rand($topics)];
                $challenge  = $this->generateChallenge($language, $difficulty, $topic);
                $challenges[] = $challenge;

                // Small delay to avoid rate limiting
                if ($i < $count - 1) {
                    sleep(1);
                }
            } catch (\Exception $e) {
                $challengeNumber = $i + 1;
                Log::warning("Failed to generate challenge {$challengeNumber}", [
                    'error' => $e->getMessage(),
                ]);
                // Continue with other challenges
            }
        }

        return $challenges;
    }

    /**
     * Topic sources
     */
    private function getTopicsForLanguage(string $language): array
    {
        $commonTopics = [
            'arrays', 'loops', 'functions', 'conditionals', 'string manipulation',
            'data validation', 'sorting', 'searching', 'recursion'
        ];

        $languageSpecific = [
            'python' => [
                'list comprehensions', 'dictionaries', 'exception handling',
                'file handling', 'classes and objects', 'decorators'
            ],
            'java' => [
                'collections', 'inheritance', 'interfaces', 'exception handling',
                'generics', 'streams', 'object-oriented programming'
            ],
            'cpp' => [
                'STL (vector, string, map)', 'iterators & algorithms', 'pointers & references',
                'memory management (RAII, smart pointers)', 'classes & objects',
                'const-correctness', 'operator overloading', 'exceptions',
                'templates & type deduction', 'I/O streams'
            ],
        ];

        $topics = array_merge($commonTopics, $languageSpecific[$language] ?? []);
        return $topics;
    }

    /**
     * Random topic picker with optional avoidance set.
     */
    private function pickRandomTopic(string $language, array $avoid = []): string
    {
        $topics = $this->getTopicsForLanguage($language);
        if (!empty($avoid)) {
            $topics = array_values(array_diff($topics, $avoid));
        }
        if (empty($topics)) {
            // Fallback if we filtered everything out
            $topics = $this->getTopicsForLanguage($language);
        }
        return $topics[array_rand($topics)];
    }
    /**
 * Generate a short / bite-sized challenge suitable for 1 XP.
 * Produces compact description (1-2 sentences), 1 intentional bug (or a very small bug),
 * and short runnable code snippets. Returns the same keys as generateChallenge but
 * with shorter description and possibly no 'hint' (or hint that can be ignored).
 */
public function generateShortChallenge(string $language, string $difficulty, string $topic = null): array
{
    // reuse the "avoid last topic" behavior
    $avoid = [];
    try {
        $recent = cache()->get("ai:last_short_topic:$language");
        if (is_string($recent) && $recent !== '') {
            $avoid[] = $recent;
        }
    } catch (\Throwable $e) { /* ignore cache errors */ }

    if ($topic === null) {
        $topic = $this->pickRandomTopic($language, $avoid);
    }

    try {
        cache()->put("ai:last_short_topic:$language", $topic, now()->addMinutes(30));
    } catch (\Throwable $e) { /* ignore */ }

    // Build a compact prompt for short challenges
    $prompt = $this->buildShortChallengePrompt($language, $difficulty, $topic);

    // small salt for variety
    try {
        $salt = bin2hex(random_bytes(3)); // 6 hex chars
        $prompt .= "\n\n#VAR_SALT={$salt}";
    } catch (\Throwable $e) { /* non-fatal */ }

    try {
        $response = Http::withHeaders([
            'api-key'      => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post(
            "{$this->endpoint}/openai/deployments/{$this->deploymentName}/chat/completions?api-version={$this->apiVersion}",
            [
                'messages' => [
                    [
                        'role'    => 'system',
                        'content' => 'You are an expert programming instructor who creates short bite-sized coding exercises. Always respond with valid JSON.'
                    ],
                    [
                        'role'    => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens'        => min(400, $this->maxTokens), // smaller responses
                'temperature'       => $this->temperature,
                'top_p'             => 0.9,
                'frequency_penalty' => 0,
                'presence_penalty'  => 0,
            ]
        );

        if (!$response->successful()) {
            Log::error('Azure OpenAI API Error (short)', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \Exception('Failed to generate short challenge: API request failed');
        }

        $data = $response->json();

        if (!isset($data['choices'][0]['message']['content'])) {
            throw new \Exception('Invalid response format from Azure OpenAI (short)');
        }

        $content = trim($data['choices'][0]['message']['content']);

        // Extract JSON if extra text exists
        $jsonStart = strpos($content, '{');
        $jsonEnd   = strrpos($content, '}');

        if ($jsonStart !== false && $jsonEnd !== false) {
            $content = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
        }

        $challengeData = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Failed to parse JSON from OpenAI response (short)', [
                'content'    => $content,
                'json_error' => json_last_error_msg(),
            ]);
            throw new \Exception('Invalid JSON response from AI service (short)');
        }

        // Minimal required fields for short challenge: title, description, buggy_code, fixed_code
        $required = ['title', 'description', 'buggy_code', 'fixed_code'];
        foreach ($required as $f) {
            if (!isset($challengeData[$f])) {
                throw new \Exception("Missing required field for short challenge: {$f}");
            }
        }

        // Return the parsed object (may include hint, but caller will ignore it)
        return $challengeData;

    } catch (\Exception $e) {
        Log::error('Error generating short challenge with Azure OpenAI', [
            'error'      => $e->getMessage(),
            'language'   => $language,
            'difficulty' => $difficulty,
            'topic'      => $topic,
        ]);
        throw $e;
    }
}

/**
 * Build compact prompt used by generateShortChallenge.
 */
private function buildShortChallengePrompt(string $language, string $difficulty, string $topic = null): string
{
    $topicText = $topic
        ? "STRICTLY focus on the topic: {$topic}."
        : "on a concise programming concept (keep it bite-sized).";

    $difficultyGuide = [
        'easy'   => 'Very short: basic syntax or one-line logical bug',
        'medium' => 'Short: small logic or off-by-one / boundary bug',
        'hard'   => 'Short but trickier: small algorithmic edge-case or performance note',
    ];

    $guide = $difficultyGuide[$difficulty] ?? 'Short micro exercise';

    $langLabel = $this->languageLabel($language);

    return "Generate a SHORT ({$langLabel}) programming exercise suitable for a 1-XP micro-task. {$topicText}

Guidelines (SHORT):
- Keep the description to 1-2 sentences.
- Provide a tiny snippet (5-20 lines) with 1 intentional bug (or very small set of issues).
- Provide the corrected snippet (fixed_code).
- Do NOT include long explanations or multiple lengthy examples.
- Responses must be VALID JSON ONLY in this format:

{
  \"title\": \"Short title (max 60 chars)\",
  \"description\": \"One- or two-sentence description of the task\",
  \"buggy_code\": \"Short code snippet (runnable if possible) containing 1 bug\",
  \"fixed_code\": \"Corrected snippet\",
  \"hint\": \"OPTIONAL short hint (one line)\"  // hint can be omitted
}

Make sure strings are properly escaped. Keep answers concise and focused.";
}


}
