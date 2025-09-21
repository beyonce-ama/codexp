<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\MatchParticipant;
// Keep the name EXACTLY as your frontend expects (it joins "presence-queue.*")
Broadcast::channel('presence-queue.{language}.{difficulty}', function ($user, $language, $difficulty) {
    return ['id' => $user->id, 'name' => $user->name];
});

// Per-user private channel
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int)$user->id === (int)$id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int)$user->id === (int)$id;
});

Broadcast::channel('presence-queue.{language}.{difficulty}', function ($user, $language, $difficulty) {
    // You can add guards per language/diff if needed
    return ['id' => $user->id, 'name' => $user->name];
});

Broadcast::channel('user.{id}', fn($user, $id) => (int)$user->id === (int)$id);

Broadcast::channel('match.{matchId}', function ($user, $matchId) {
    return MatchParticipant::where('match_id', $matchId)
        ->where('user_id', $user->id)
        ->exists();
});