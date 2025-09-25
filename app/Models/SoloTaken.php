<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoloTaken extends Model
{
    protected $table = 'solo_taken';

    protected $fillable = [
        'user_id','challenge_id','language','difficulty','mode','status',
        'time_spent_sec','submit_count','last_similarity','earned_xp',
        'code_submitted','started_at','ended_at'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at'   => 'datetime',
    ];
}
