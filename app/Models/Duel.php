<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Duel extends Model
{
    protected $fillable = [
        'challenger_id','opponent_id','challenge_id','language','status',
        'started_at','ended_at','winner_id','duration_sec','winner_xp','winner_stars'
    ];

    protected $casts = ['started_at'=>'datetime','ended_at'=>'datetime'];

    public function challenger(){ return $this->belongsTo(User::class,'challenger_id'); }
    public function opponent(){ return $this->belongsTo(User::class,'opponent_id'); }
    public function winner(){ return $this->belongsTo(User::class,'winner_id'); }
    public function challenge(){ return $this->belongsTo(Challenge1v1::class,'challenge_id'); }
    public function submissions(){ return $this->hasMany(DuelSubmission::class); }
}
