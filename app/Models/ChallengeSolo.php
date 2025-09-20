<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeSolo extends Model
{
    protected $table = 'challenges_solo';
    protected $fillable = [
        'mode','language','difficulty','title','description',
        'buggy_code','fixed_code','hint','payload_json','source_file','reward_xp'
    ];
    protected $casts = ['payload_json' => 'array'];
}
