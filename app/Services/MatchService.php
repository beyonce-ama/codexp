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

            // Challenge comes from challenge_json
            $challengeData = json_decode($match->challenge_json ?? '{}', true);
            $challenge     = $challengeData['challenge'] ?? $challengeData;
            $fixed         = $challenge['fixed_code'] ?? null;
            if (!$fixed) return ['ok'=>false, 'reason'=>'payload_missing'];

            // Quick normalization + compare
            [$a, $b] = [$this->canonicalize($code), $this->canonicalize($fixed)];
            $isCorrect = hash('sha256', $a) === hash('sha256', $b);

            // Save submission
            DB::table('match_submissions')->insert([
                'match_id'   => $match->id,
                'user_id'    => $userId,
                'code'       => $code,
                'is_correct' => $isCorrect ? 1 : 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // If first correct -> finish & reward exactly once
            if ($isCorrect && empty($match->winner_user_id)) {
                $match->winner_user_id = $userId;
                $match->status         = 'finished';
                $match->finished_at    = now();
                $match->save();

                $this->applyRewards($match, $userId); // <-- rewards + stats
            }

            return ['ok'=>true, 'is_correct'=>$isCorrect];
        });
    }

 public function surrender(int $matchId, int $userId) : array
    {
        return DB::transaction(function () use ($matchId, $userId) {
            $match = MatchModel::lockForUpdate()->findOrFail($matchId);
            if ($match->status !== 'active') return ['ok'=>false, 'reason'=>'not_active'];

            // Optional: record surrender time only if column exists
            $schema = DB::getSchemaBuilder();
            if ($schema->hasColumn('match_participants', 'surrendered_at')) {
                DB::table('match_participants')
                    ->where('match_id', $matchId)->where('user_id', $userId)
                    ->update(['surrendered_at'=>now()]);
            }

            // Opponent becomes winner (if no winner yet)
            $opponentId = (int) DB::table('match_participants')
                ->where('match_id', $matchId)->where('user_id','!=',$userId)
                ->value('user_id');

            if (empty($match->winner_user_id)) {
                $match->winner_user_id = $opponentId;
                $match->status         = 'finished';
                $match->finished_at    = now();
                $match->save();

                $this->applyRewards($match, $opponentId); // <-- rewards + stats
            }

            return ['ok'=>true];
        });
    }

 private function applyRewards(MatchModel $match, int $winnerId): void
    {
        $xp   = $this->xpForDifficulty($match->difficulty);
        $lang = $match->language;

        // winner / loser
        $ids     = DB::table('match_participants')->where('match_id', $match->id)->pluck('user_id')->all();
        $loserId = (int) (($ids[0] == $winnerId) ? $ids[1] : $ids[0]);

        // users table: xp + stars
        DB::table('users')->where('id', $winnerId)->update([
            'total_xp'   => DB::raw('COALESCE(total_xp,0)+'.$xp),
            'stars'      => DB::raw('COALESCE(stars,0)+1'),
            'updated_at' => now(),
        ]);
        DB::table('users')->where('id', $loserId)->update([
            'stars'      => DB::raw('GREATEST(COALESCE(stars,0)-1,0)'),
            'updated_at' => now(),
        ]);

        // language stats (create if missing, then increment + recompute winrate)
        foreach ([$winnerId => 'win', $loserId => 'loss'] as $uid => $kind) {
            DB::table('user_language_stats')->updateOrInsert(
                ['user_id'=>$uid, 'language'=>$lang],
                ['games_played'=>0, 'wins'=>0, 'losses'=>0, 'winrate'=>0, 'created_at'=>now(), 'updated_at'=>now()]
            );

            DB::table('user_language_stats')
                ->where(['user_id'=>$uid, 'language'=>$lang])
                ->increment('games_played', 1);

            if ($kind === 'win') {
                DB::table('user_language_stats')
                    ->where(['user_id'=>$uid, 'language'=>$lang])
                    ->increment('wins', 1);
            } else {
                DB::table('user_language_stats')
                    ->where(['user_id'=>$uid, 'language'=>$lang])
                    ->increment('losses', 1);
            }

            DB::table('user_language_stats')
                ->where(['user_id'=>$uid, 'language'=>$lang])
                ->update([
                    'winrate'   => DB::raw('ROUND(wins / NULLIF(games_played,0), 3)'),
                    'updated_at'=> now(),
                ]);
        }
    }

    private function xpForDifficulty(?string $d): int
    {
        return match ($d) {
            'hard'   => 6,
            'medium' => 4,
            default  => 3, // easy / fallback
        };
    }

    private function canonicalize(string $code): string
    {
        $code = preg_replace("/\r\n?/", "\n", $code);
        $code = preg_replace('/[ \t]+$/m', '', $code);
        $code = preg_replace("/\n{3,}/", "\n\n", $code);
        return trim($code);
    }

    private function diffSummary(string $a, string $b): ?string
    {
        // keep short; you can plug a real diff lib if you want
        if (strlen($a) === strlen($b)) return 'Output differs.';
        return strlen($a) < strlen($b) ? 'Your code is missing parts.' : 'Your code has extra parts.';
    }
}