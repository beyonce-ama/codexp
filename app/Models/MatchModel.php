<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MatchModel extends Model
{
    protected $table = 'matches';

    // add 'mode' if you set it when creating matches
    protected $fillable = ['language', 'difficulty', 'status', 'challenge_json', 'mode'];
        
    protected $casts = [
        'payload'        => 'array',
        'challenge_json' => 'array',
    ];

    /** Include normalized challenge in JSON output */
    protected $appends = ['challenge'];

    /** Optional: hide the raw blobs */
    protected $hidden = ['payload','challenge_json'];


    protected static function booted()
    {
        // Always assign a slug-like public id on create
        static::creating(function (MatchModel $match) {
            if (empty($match->public_id)) {
                $match->public_id = (string) Str::uuid();
            }
        });
    }

    public function participants()
    {
        return $this->hasMany(MatchParticipant::class, 'match_id');
    }

    /**
     * Normalized challenge accessor.
     * Works with either:
     *  - $this->payload['challenge'] (legacy)
     *  - $this->challenge_json['challenge'] or flat challenge_json
     *  - stringified challenge_json (fallback decode)
     */
    public function getChallengeAttribute()
    {
        // Prefer legacy payload if present
        if (is_array($this->payload ?? null)) {
            return $this->payload['challenge'] ?? $this->payload;
        }

        // If challenge_json is already cast to array
        if (is_array($this->challenge_json ?? null)) {
            $cj = $this->challenge_json;
            return $cj['challenge'] ?? $cj;
        }

        // Fallback: decode string challenge_json
        $legacy = json_decode($this->challenge_json ?? 'null', true);
        return is_array($legacy) ? ($legacy['challenge'] ?? $legacy) : null;
    }
}
