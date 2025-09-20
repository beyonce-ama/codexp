<?php

return [
    'openai' => [
        'endpoint' => env('AZURE_OPENAI_ENDPOINT'),
        'api_key' => env('AZURE_OPENAI_API_KEY'),
        'deployment_name' => env('AZURE_OPENAI_DEPLOYMENT_NAME'),
        'api_version' => env('AZURE_OPENAI_API_VERSION', '2024-02-15-preview'),
        'max_tokens' => (int) env('AZURE_OPENAI_MAX_TOKENS', 1000),
        'temperature' => (float) env('AZURE_OPENAI_TEMPERATURE', 0.7),
    ],
];