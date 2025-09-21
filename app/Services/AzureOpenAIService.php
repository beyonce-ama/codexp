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
        $this->endpoint = rtrim(config('azure.openai.endpoint'), '/');
        $this->apiKey = config('azure.openai.api_key');
        $this->deploymentName = config('azure.openai.deployment_name');
        $this->apiVersion = config('azure.openai.api_version');
        $this->maxTokens = config('azure.openai.max_tokens', 1000);
        $this->temperature = config('azure.openai.temperature', 0.7);
    }

    public function generateChallenge(string $language, string $difficulty, string $topic = null): array
    {
        $prompt = $this->buildChallengePrompt($language, $difficulty, $topic);
        
        try {
            $response = Http::withHeaders([
                'api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post(
                "{$this->endpoint}/openai/deployments/{$this->deploymentName}/chat/completions?api-version={$this->apiVersion}",
                [
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an expert programming instructor who creates coding challenges. Always respond with valid JSON format containing the required fields.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'max_tokens' => $this->maxTokens,
                    'temperature' => $this->temperature,
                    'top_p' => 0.95,
                    'frequency_penalty' => 0,
                    'presence_penalty' => 0,
                ]
            );

            if (!$response->successful()) {
                Log::error('Azure OpenAI API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
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
            $jsonEnd = strrpos($content, '}');
            
            if ($jsonStart !== false && $jsonEnd !== false) {
                $content = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
            }
            
            $challengeData = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Failed to parse JSON from OpenAI response', [
                    'content' => $content,
                    'json_error' => json_last_error_msg()
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
                'error' => $e->getMessage(),
                'language' => $language,
                'difficulty' => $difficulty,
                'topic' => $topic
            ]);
            throw $e;
        }
    }

    private function buildChallengePrompt(string $language, string $difficulty, string $topic = null): string
    {
        $topicText = $topic ? "focused on {$topic}" : "on any programming concept";
        
        $difficultyGuide = [
            'easy' => 'Basic syntax, simple logic, beginner-friendly concepts',
            'medium' => 'Intermediate algorithms, data structures, moderate complexity',
            'hard' => 'Advanced algorithms, complex logic, optimization challenges'
        ];

        $guide = $difficultyGuide[$difficulty] ?? 'Mixed difficulty';

        return "Generate a {$difficulty} level {$language} programming challenge {$topicText}.

Guidelines:
- Difficulty: {$guide}
- The challenge should have intentional bugs that students need to fix
- Include clear description and helpful hints
- Code should be educational and practical

Respond with ONLY a JSON object in this exact format:
{
    \"title\": \"Challenge title (max 100 chars)\",
    \"description\": \"Detailed problem description explaining what the code should do and what's wrong\",
    \"buggy_code\": \"{$language} code with 2-3 intentional bugs\",
    \"fixed_code\": \"The same code with bugs fixed\",
    \"hint\": \"Helpful hint about what to look for or how to approach the problem\"
}

Make sure:
1. The buggy_code actually has logical bugs (syntax errors, logic mistakes, wrong operators, etc.)
2. The fixed_code is the corrected version
3. The description explains the intended functionality
4. The hint guides students without giving away the answer
5. All JSON strings are properly escaped
6. Code is realistic and educational";
    }

    public function generateMultipleChallenges(string $language, string $difficulty, int $count = 3): array
    {
        $challenges = [];
        $topics = $this->getTopicsForLanguage($language);
        
        for ($i = 0; $i < $count; $i++) {
            try {
                $topic = $topics[array_rand($topics)];
                $challenge = $this->generateChallenge($language, $difficulty, $topic);
                $challenges[] = $challenge;
                
                // Small delay to avoid rate limiting
                if ($i < $count - 1) {
                    sleep(1);
                }
            } catch (\Exception $e) {
                $challengeNumber = $i + 1;
                Log::warning("Failed to generate challenge {$challengeNumber}", [
                    'error' => $e->getMessage()
                ]);
                // Continue with other challenges
            }
        }

        return $challenges;
    }

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
            ]
        ];

        $topics = array_merge($commonTopics, $languageSpecific[$language] ?? []);
        return $topics;
    }

 }