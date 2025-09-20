<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MatchSearch extends Model {
  protected $fillable = ['user_id','language','difficulty','status'];
}