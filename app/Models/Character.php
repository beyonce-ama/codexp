<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
    protected $fillable = ['name','asset_idle','asset_happy','asset_sad','asset_thinking'];
}
