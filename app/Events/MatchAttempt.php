<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Queue\SerializesModels;

class MatchAttempt implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $matchId,
        public int $userId,
        public bool $correct,
        public string $message
    ) {}

    public function broadcastOn(): array
    {
        // Change this to match what your React component expects
        return [new PrivateChannel("private-match.{$this->matchId}")];
    }

    // Explicitly set the event name to avoid any naming issues
    public function broadcastAs(): string
    {
        return 'MatchAttempt';
    }

    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->matchId,
            'user_id'  => $this->userId,
            'correct'  => $this->correct,
            'message'  => $this->message,
        ];
    }
}