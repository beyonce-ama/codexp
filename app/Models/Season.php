<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Season extends Model
{
    protected $primaryKey = 'season_id';
    protected $fillable = ['code','name','starts_at','ends_at','is_active'];

    public function scopeActive($q){ return $q->where('is_active', true); }

    public function userSeasons(){ return $this->hasMany(UserSeason::class, 'season_id', 'season_id'); }
}
