<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DuelSubmission extends Model
{
    protected $fillable = ['duel_id','user_id','code_submitted','is_correct','judge_feedback','time_spent_sec'];

    public function duel(){ return $this->belongsTo(Duel::class); }
    public function user(){ return $this->belongsTo(User::class); }
}
