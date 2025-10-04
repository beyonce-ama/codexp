<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\MatchParticipant;

// Presence queue: used by Echo.join(`presence-queue.{language}.{difficulty}`)
Broadcast::channel('presence-queue.{language}.{difficulty}', function ($user, $language, $difficulty) {
    // Return member info for presence channels
    return [
        'id'   => $user->id,
        'name' => $user->name,
    ];
});

// Per-user private channel: Echo.private(`user.{id}`)
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Match room (optional): Echo.private(`match.{matchId}`)
Broadcast::channel('match.{matchId}', function ($user, $matchId) {
    return MatchParticipant::where('match_id', $matchId)
        ->where('user_id', $user->id)
        ->exists();
});
