<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MatchParticipant extends Model {
  protected $fillable = ['match_id','user_id'];
  public function match() { return $this->belongsTo(MatchModel::class, 'match_id'); }
}