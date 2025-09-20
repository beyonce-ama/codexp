<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoloAttempt extends Model
{
    protected $fillable = [
        'user_id','challenge_id','language','mode','time_spent_sec','is_correct',
        'code_submitted','judge_feedback','xp_earned','stars_earned'
    ];

    public function user(){ return $this->belongsTo(User::class); }
    public function challenge(){ return $this->belongsTo(ChallengeSolo::class,'challenge_id'); }
}
