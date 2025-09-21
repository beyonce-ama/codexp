<?php
namespace App\Services;

use App\Models\MatchModel;
use App\Models\MatchParticipant;
use App\Models\MatchSubmission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MatchService
{
  public function submitCode(int $matchId, int $userId, string $code) : array
{
    return DB::transaction(function () use ($matchId, $userId, $code) {
        $match = MatchModel::lockForUpdate()->findOrFail($matchId);
        if ($match->status !== 'active') {
            return ['ok'=>false, 'reason'=>'match_not_active'];
        }

        // FIXED: Get challenge from challenge_json, not payload
        $challengeData = json_decode($match->challenge_json ?? '{}', true);
        $challenge = $challengeData['challenge'] ?? $challengeData;
        
        // FIXED: Get fixed_code from the challenge data
        $fixed = $challenge['fixed_code'] ?? null;
        if (!$fixed) return ['ok'=>false, 'reason'=>'payload_missing'];

        // Normalize both codes before comparing
        [$normSubmitted, $normFixed] = [$this->canonicalize($code), $this->canonicalize($fixed)];
        $isCorrect = hash('sha256', $normSubmitted) === hash('sha256', $normFixed);

        // ✅ DEBUG: Log before saving
        \Log::debug('Saving submission to database:', [
            'match_id' => $matchId,
            'user_id' => $userId,
            'code_length' => strlen($code),
            'is_correct' => $isCorrect
        ]);

        // Save submission - FIXED: Use correct column names for your table
        DB::table('match_submissions')->insert([
            'match_id' => $match->id,
            'user_id'  => $userId,
            'code'     => $code,
            'is_correct' => $isCorrect ? 1 : 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ✅ DEBUG: Verify it was saved
        $saved = DB::table('match_submissions')
            ->where('match_id', $matchId)
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->first();
            
        \Log::debug('Submission saved:', ['saved' => $saved]);

        // If correct → finish the match and set winner exactly once
        if ($isCorrect && empty($match->winner_user_id)) {
            $match->winner_user_id = $userId;
            $match->status = 'finished';
            $match->finished_at = now();
            $match->save();
        }

        return ['ok'=>true, 'is_correct'=>$isCorrect];
    });
}

    public function surrender(int $matchId, int $userId) : array
    {
        return DB::transaction(function () use ($matchId, $userId) {
            $match = MatchModel::lockForUpdate()->findOrFail($matchId);
            if ($match->status !== 'active') return ['ok'=>false, 'reason'=>'not_active'];

            // mark surrenderer
            MatchParticipant::where('match_id',$matchId)->where('user_id',$userId)
                ->update(['surrendered_at'=>now()]);

            // find opponent
            $opponentId = MatchParticipant::where('match_id',$matchId)
                ->where('user_id','!=',$userId)->value('user_id');

            // finish if no winner yet
            if (empty($match->winner_user_id)) {
                $match->winner_user_id = $opponentId;
                $match->status = 'finished';
                $match->finished_at = now();
                $match->save();
            }

            return ['ok'=>true];
        });
    }

    private function canonicalize(string $code): string
    {
        // Remove trailing spaces, normalize newlines, strip BOM, collapse blank lines
        $code = preg_replace("/\r\n?/", "\n", $code);
        $code = preg_replace('/[ \t]+$/m', '', $code);
        $code = preg_replace("/\n{3,}/", "\n\n", $code);
        // Remove comment-only whitespace differences optionally
        return trim($code);
    }

    private function diffSummary(string $a, string $b): ?string
    {
        // keep short; you can plug a real diff lib if you want
        if (strlen($a) === strlen($b)) return 'Output differs.';
        return strlen($a) < strlen($b) ? 'Your code is missing parts.' : 'Your code has extra parts.';
    }
}