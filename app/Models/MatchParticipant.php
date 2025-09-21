<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchParticipant extends Model
{
    protected $table = 'match_participants';
    public $timestamps = true; // created_at / updated_at exist in your table

    // IMPORTANT: include join_secret so create()/update() will persist it
    protected $fillable = [
        'match_id',
        'user_id',
        'join_secret',      // <-- this was missing
        'surrendered_at',   // keep if you have this column, otherwise remove
    ];

    protected $casts = [
        'surrendered_at' => 'datetime',
    ];

    public function match()
    {
        return $this->belongsTo(MatchModel::class, 'match_id');
    }
}
