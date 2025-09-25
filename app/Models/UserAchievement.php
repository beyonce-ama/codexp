<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAchievement extends Model
{
    protected $fillable = ['user_id','achievement_id','unlocked_at','notified_at'];

    public function achievement() {
        return $this->belongsTo(Achievement::class);
    }
}
