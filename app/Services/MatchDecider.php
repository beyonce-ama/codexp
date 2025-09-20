<?php
namespace App\Services;

use App\Models\MatchmakingTicket;
use App\Models\DuelMatch;
use App\Services\AzureOpenAIService; // your existing service
use Illuminate\Support\Facades\DB;

class MatchDecider
{
    public function maybeEnd(DuelMatch $match): ?array
    {
        if ($match->state === 'ended') return null;

        $subs = DuelSubmission::where('duel_match_id',$match->id)
            ->where('is_correct', true)
            ->get()
            ->groupBy('user_id')
            ->map->min('time_spent_ms');

        $p1 = $subs->get($match->player1_id);
        $p2 = $subs->get($match->player2_id);

        if (!isset($p1) || !isset($p2)) return null; // wait for both

        $winner = ($p1 === $p2) ? null : ($p1 < $p2 ? $match->player1_id : $match->player2_id);

        $match->update(['state'=>'ended','ended_at'=>now()]);

        // reward (example; hook to your existing XP logic)
        $this->award($match, $winner, $p1, $p2);

        broadcast(new \App\Events\MatchEnded($match->id, $winner, $p1, $p2));

        return ['winner_id'=>$winner, 'reason'=>'faster_correct', 'p1_ms'=>$p1, 'p2_ms'=>$p2];
    }

    public function forfeit(DuelMatch $match, int $loserId): void
    {
        if ($match->state === 'ended') return;
        $winner = $loserId === $match->player1_id ? $match->player2_id : $match->player1_id;
        $match->update(['state'=>'ended','ended_at'=>now()]);
        $this->award($match, $winner, null, null);
        broadcast(new \App\Events\MatchEnded($match->id, $winner, null, null));
    }

    private function award(DuelMatch $match, ?int $winnerId, $p1ms, $p2ms): void
    {
        // Example XP rule (tweak to your existing consistent rules):
        // easy 2.5, medium 4.0, hard 6.0; -0.5 if used hint
        $base = ['easy'=>2.5,'medium'=>4.0,'hard'=>6.0][$match->difficulty] ?? 2.5;

        foreach ([$match->player1_id, $match->player2_id] as $uid) {
            $usedHint = DuelSubmission::where('duel_match_id',$match->id)
                         ->where('user_id',$uid)->where('attempt',1)
                         ->whereNotNull('id') // placeholder for where you track hint
                         ->exists(); // replace with your real "used_hint" storage
            $earned = ($winnerId && $uid === $winnerId) ? max(0, $base - ($usedHint?0.5:0)) : 0;
            // Update your stats model(s) here…
        }
    }
}
