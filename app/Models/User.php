<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail; // 👈 add this

class User extends Authenticatable implements MustVerifyEmail // 👈 implement this
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'stars',
        'total_xp',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'stars'             => 'integer',
        'total_xp'          => 'decimal:2',
    ];

    // Add computed fields
    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? '/'.ltrim($this->avatar, '/') : null;
    }

    // Relationships
    public function allDuels()
    { 
        return $this->hasMany(Duel::class, 'challenger_id')
            ->union($this->hasMany(Duel::class, 'opponent_id')); 
    }

    public function wonDuels()
    { 
        return $this->hasMany(Duel::class, 'winner_id'); 
    }

    public function profile()
    { 
        return $this->hasOne(UserProfile::class); 
    }

    public function languageStats()
    { 
        return $this->hasMany(UserLanguageStat::class); 
    }

    public function soloAttempts()
    { 
        return $this->hasMany(SoloAttempt::class); 
    }

    public function duelsAsChallenger()
    { 
        return $this->hasMany(Duel::class, 'challenger_id'); 
    }

    public function duelsAsOpponent()
    { 
        return $this->hasMany(Duel::class, 'opponent_id'); 
    }

    public function duelSubmissions()
    { 
        return $this->hasMany(DuelSubmission::class); 
    }

    public function achievements()
    {
        return $this->belongsToMany(\App\Models\Achievement::class, 'user_achievements')
            ->withPivot(['unlocked_at','claimed_at','notified_at','created_at','updated_at']);
    }

    public function userAchievements()
    {
        return $this->hasMany(\App\Models\UserAchievement::class);
    }
}
