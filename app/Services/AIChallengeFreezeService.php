<?php

namespace App\Services;

class AIChallengeFreezeService
{
    public function __construct(private AzureOpenAIService $azure) {}

    public function freeze(string $matchId, string $language, string $difficulty, string $mode): array
    {
        // Generate once for the match; in production, persist by $matchId.
        $payload = $this->azure->generateFixBugsChallenge($language, $difficulty);
        $payload['mode'] = $mode;
        return $payload;
    }
}
