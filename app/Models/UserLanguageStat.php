<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLanguageStat extends Model
{
    protected $fillable = [
        'user_id',
        'language',
        'games_played',
        'wins',
        'losses',
        'winrate',
        'solo_completed'
    ];

    protected $casts = [
        'games_played' => 'integer',
        'wins' => 'integer',
        'losses' => 'integer',
        'winrate' => 'float',
        'solo_completed' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}