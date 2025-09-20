<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MatchModel extends Model {
  protected $table = 'matches';
  protected $fillable = ['language','difficulty','status','challenge_json'];
  public function participants() { return $this->hasMany(MatchParticipant::class, 'match_id'); }
}