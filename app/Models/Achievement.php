<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'code','name','description','scope','threshold',
        'icon_key','xp_reward','stars_reward','enabled'
    ];
}
