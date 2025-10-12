<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSeason extends Model
{
    protected $fillable = [
        'season_id','user_id','season_xp','season_stars','final_rank','is_champion','snapshot_at'
    ];

    public function season(){ return $this->belongsTo(Season::class, 'season_id', 'season_id'); }
    public function user(){ return $this->belongsTo(User::class); }
}
