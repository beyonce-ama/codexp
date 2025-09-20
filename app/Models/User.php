<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = ['name','email','password','role','stars','total_xp'];
    protected $hidden = ['password','remember_token'];
    protected $casts = ['email_verified_at' => 'datetime',
         'stars'    => 'integer',
        'total_xp' => 'decimal:2',
    ];

    public function allDuels() { 
        return $this->hasMany(Duel::class, 'challenger_id')
            ->union($this->hasMany(Duel::class, 'opponent_id')); 
    }

    public function wonDuels() { 
        return $this->hasMany(Duel::class, 'winner_id'); 
    }

    public function profile(){ return $this->hasOne(UserProfile::class); }
    public function languageStats(){ return $this->hasMany(UserLanguageStat::class); }
    public function soloAttempts(){ return $this->hasMany(SoloAttempt::class); }
    public function duelsAsChallenger(){ return $this->hasMany(Duel::class, 'challenger_id'); }
    public function duelsAsOpponent(){ return $this->hasMany(Duel::class, 'opponent_id'); }
    public function duelSubmissions(){ return $this->hasMany(DuelSubmission::class); }
}
