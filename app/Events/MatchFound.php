<?php

namespace App\Events;

use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchFound implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $match_id,
        public array $participants, // [p1_id, p2_id]
        public string $language,
        public string $difficulty
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel("presence-queue.{$this->language}.{$this->difficulty}"),
            new PrivateChannel("user.{$this->participants[0]}"),
            new PrivateChannel("user.{$this->participants[1]}"),
        ];
    }

    public function broadcastAs(): string { return 'MatchFound'; }

    public function broadcastWith(): array
    {
        return [
            'match_id'     => $this->match_id,
            'participants' => $this->participants,
        ];
    }
}
