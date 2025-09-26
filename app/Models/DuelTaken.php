<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DuelTaken extends Model
{
    protected $table = 'duels_taken';

    protected $fillable = [
        'user_id','duel_id','match_id','source','language','status',
        'is_winner','time_spent_sec','xp_earned','stars_earned',
        'started_at','ended_at',
    ];

    protected $casts = [
        'is_winner'   => 'boolean',
        'started_at'  => 'datetime',
        'ended_at'    => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function duel() { return $this->belongsTo(Duel::class); }
    // public function match() { return $this->belongsTo(Match::class); } // when you add a Match model
}
