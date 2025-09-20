<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = ['user_id','type','title','message','status'];
    public function user(){ return $this->belongsTo(User::class); }
}
