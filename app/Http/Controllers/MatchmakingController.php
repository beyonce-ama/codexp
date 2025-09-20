<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\MatchSearch;
use App\Models\MatchModel;
use App\Models\MatchParticipant;

class MatchmakingController extends Controller
{
   public function join(Request $r)
    {
        $u = $r->user();
        $data = $r->validate([
            'language'   => 'required|in:python,java',
            'difficulty' => 'required|in:easy,medium,hard',
            'mode'       => 'required|in:aigenerated',
        ]);

        // If I’m already in a running/matched game, just return it (prevents reusing old tickets)
        $existing = MatchParticipant::query()
            ->where('user_id', $u->id)
            ->whereHas('match', fn($q) => $q->whereIn('status', ['matched','running']))
            ->latest('id')
            ->value('match_id');

        if ($existing) {
            return response()->json(['match_id' => $existing]);
        }

        // Ensure I only have one active queue ticket
        MatchSearch::where('user_id', $u->id)
            ->where('status', 'searching')
            ->update(['status' => 'cancelled']);

        // Create fresh ticket
        $mine = MatchSearch::create([
            'user_id'    => $u->id,
            'language'   => $data['language'],
            'difficulty' => $data['difficulty'],
            'mode'       => $data['mode'],
            'status'     => 'searching',
        ]);

        // Try to pair strictly on language+difficulty+mode, atomically
        $matchId = DB::transaction(function () use ($u, $data, $mine) {
            // lock me
            $meLocked = MatchSearch::whereKey($mine->id)->lockForUpdate()->first();
            if (!$meLocked || $meLocked->status !== 'searching') return null;

            // lock an opponent with the exact same filters
            $opponent = MatchSearch::query()
                ->where('status', 'searching')
                ->where('user_id', '<>', $u->id)
                ->where('language',   $data['language'])
                ->where('difficulty', $data['difficulty'])
                ->where('mode',       $data['mode'])
                ->orderBy('id')
                ->lockForUpdate()
                ->first();

            if (!$opponent) return null;

            // Freeze a single challenge (unique per match)
            // generateFor1v1 should always return a NEW frozen challenge array/json
            $frozen = app(\App\Http\Controllers\AIChallengeController::class)
                        ->generateFor1v1($data['language'], $data['difficulty'], $data['mode']);

            $match = MatchModel::create([
                'language'       => $data['language'],
                'difficulty'     => $data['difficulty'],
                'mode'           => $data['mode'],
                'status'         => 'matched', // the board will flip this to 'running' once both are ready
                 'challenge_json' => json_encode($frozen), 
            ]);

            MatchParticipant::create(['match_id' => $match->id, 'user_id' => $u->id]);
            MatchParticipant::create(['match_id' => $match->id, 'user_id' => $opponent->user_id]);

            $meLocked->update(['status' => 'paired',   'matched_at' => now()]);
            $opponent->update(['status' => 'paired',   'matched_at' => now()]);

            return $match->id;
        });

        if ($matchId) {
            return response()->json(['match_id' => $matchId, 'ticket_id' => (string)$mine->id]);
        }

        return response()->json(['ticket_id' => (string)$mine->id]);
    }
     public function poll(Request $r)
    {
        $u = $r->user();

        $matchId = MatchParticipant::query()
            ->where('user_id', $u->id)
            ->whereHas('match', fn($q) =>
                $q->whereIn('status', ['matched','running']) // exclude finished/abandoned
            )
            ->latest('id')
            ->value('match_id');

        if ($matchId) {
            return response()->json(['match_id' => $matchId]);
        }
        return response()->json(['searching' => true]);
    }

  public function cancel(Request $r)
  {
    MatchSearch::where('user_id',$r->user()->id)->where('status','searching')->update(['status'=>'cancelled']);
    return response()->json(['ok'=>true]);
  }
}
