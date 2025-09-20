<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MatchModel;

class MatchRuntimeController extends Controller
{
  public function show(Request $request, int $matchId)
  {
    $me = $request->user()->id;

    $match = MatchModel::with('participants')->findOrFail($matchId);
    if (! $match->participants->pluck('user_id')->contains($me)) {
      abort(403, 'Not your match');
    }

    return \Inertia\Inertia::render('Participant/MatchStart', [
      'match' => [
        'id'=>$match->id,
        'language'=>$match->language,
        'difficulty'=>$match->difficulty,
        'mode'=>'aigenerated',
        'me'=>$me,
        'opponent'=>$match->participants->firstWhere('user_id','<>',$me)?->user_id,
      ],
      'challenge' => json_decode($match->challenge_json, true),
      'ui' => ['showOpponentAsAnimation'=>true],
    ]);
  }
  public function submit(Request $r, MatchModel $match)
{
    $userId = $r->user()->id;

    // Must be a participant
    $isMine = MatchParticipant::where('match_id',$match->id)->where('user_id',$userId)->exists();
    abort_unless($isMine, 403);

    $data = $r->validate(['code' => 'required|string']);

    // Load frozen challenge
    $payload = json_decode($match->challenge_json, true) ?: [];
    $fixed   = (string)($payload['fixed_code'] ?? '');

    // Minimal judge (string compare, normalized) — replace with a test runner later
    $normalize = fn(string $s) => preg_replace('/\s+/', '', trim($s));
    $correct = $fixed !== '' && $normalize($data['code']) === $normalize($fixed);

    if (!$correct) {
        return response()->json(['correct' => false, 'message' => 'Wrong answer. Keep trying.']);
    }

    // First to solve wins
    return DB::transaction(function () use ($match, $userId) {
        if ($match->status !== 'finished') {
            // mark finished + reward
            $match->status = 'finished';
            $match->save();

            // naive XP/Star rule — adjust to your columns
            $xpMap = ['easy'=>3,'medium'=>4,'hard'=>6];
            $xp    = $xpMap[$match->difficulty] ?? 3;

            // You likely have users.total_xp and users.stars (int/float) — update both participants
            $pids = \App\Models\MatchParticipant::where('match_id',$match->id)->pluck('user_id')->all();
            $winnerId = $userId;
            $loserId  = array_values(array_diff($pids, [$winnerId]))[0] ?? null;

            if ($winnerId) DB::table('users')->where('id',$winnerId)->update([
                'total_xp' => DB::raw("COALESCE(total_xp,0)+$xp"),
                'stars'    => DB::raw("COALESCE(stars,0)+1"),
            ]);
            if ($loserId) DB::table('users')->where('id',$loserId)->update([
                'stars'    => DB::raw("GREATEST(0, COALESCE(stars,0)-1)"),
            ]);
        }
        return response()->json(['correct' => true, 'message' => 'You win!']);
    });
}

public function finalize(Request $r, int $match)
{
    $u = $r->user();

    // optional: verify $u is a participant in this match
    \App\Models\MatchModel::where('id', $match)->update([
        'status' => 'finished',
        'finished_at' => now(),
    ]);

    // clear any leftover search tickets for both users (belt & suspenders)
    $userIds = \App\Models\MatchParticipant::where('match_id', $match)->pluck('user_id');
    \App\Models\MatchSearch::whereIn('user_id', $userIds)->where('status', 'searching')->update(['status' => 'cancelled']);

    return response()->json(['ok' => true]);
}

}
