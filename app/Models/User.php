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
        'avatar',

        // Lifetime
        'stars',
        'total_xp',

        // Seasonal
        'season_xp',
        'season_stars',
        'crowns',
        'last_season_id',
        'last_season_rank',
    ];


    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',

        // Lifetime
        'stars'             => 'integer',
        'total_xp'          => 'decimal:2',

        // Seasonal
        'season_xp'         => 'integer',
        'season_stars'      => 'integer',
        'crowns'            => 'integer',
        'last_season_id'    => 'integer',
        'last_season_rank'  => 'integer',
    ];


    // Add computed fields
    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? '/'.ltrim($this->avatar, '/') : null;
    }

    // Relationships

        /**
     * Season snapshot rows (history).
     */
    public function seasons()
    {
        return $this->hasMany(\App\Models\UserSeason::class, 'user_id', 'id');
    }

    /**
     * The season this user last finished (used for badge like "Last Season #1").
     */
    public function lastSeason()
    {
        return $this->belongsTo(\App\Models\Season::class, 'last_season_id', 'season_id');
    }

    /**
     * Award both lifetime and seasonal counters in one call.
     * Safe to call with 0 for either param.
     */
    public function awardSeasonal(int $xp = 0, int $stars = 0): void
    {
        if ($xp !== 0) {
            // lifetime + seasonal xp
            $this->increment('total_xp', $xp);
            $this->increment('season_xp', $xp);
        }
        if ($stars !== 0) {
            // lifetime + seasonal stars
            $this->increment('stars', $stars);
            $this->increment('season_stars', $stars);
        }
    }

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
