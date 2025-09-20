<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge1v1 extends Model
{
    protected $table = 'challenges_1v1';
    protected $fillable = [
        'language','difficulty','title','description',
        'buggy_code','fixed_code','payload_json','source_file'
    ];
    protected $casts = ['payload_json' => 'array'];
}
