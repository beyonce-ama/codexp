<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $fillable = [
        'uuid',
        'title',
        'description',
        'language',
        'difficulty',
        'starter_code',
        'tests',          // JSON
        'time_limit_ms',
        'memory_limit',
        'source',
    ];

    protected $casts = [
        'tests' => 'array',
    ];
}
