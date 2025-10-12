<?php

namespace App\Console\Commands;

use App\Models\Season;
use App\Models\User;
use App\Models\UserSeason;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RolloverSeason extends Command
{
    protected $signature = 'season:rollover';
    protected $description = 'Snapshot leaderboard, award champion, reset season stats, and create next 90-day season.';

    public function handle(): int
    {
        $now = Carbon::now();
        /** @var Season|null $active */
        $active = Season::active()->orderBy('starts_at','desc')->first();

        if (!$active) {
            // No active season — create one starting now
            $this->createNextSeason(null, $now);
            $this->info('No active season found. Created Season 1.');
            return self::SUCCESS;
        }

        if ($now->lt(Carbon::parse($active->ends_at))) {
            $this->info('Season still running; nothing to do.');
            return self::SUCCESS;
        }

        DB::transaction(function() use ($active, $now) {
            // 1) Snapshot leaderboard (rank by season_xp desc, then season_stars desc, then id asc)
            $users = User::select('id','season_xp','season_stars')->get()
                ->sortBy(function($u){ return sprintf('%010d-%010d-%010d', 9999999999 - $u->season_xp, 9999999999 - $u->season_stars, $u->id); })
                ->values();

            $championUserId = null;

            foreach ($users as $idx => $u) {
                $rank = $idx + 1;
                $isChampion = ($rank === 1);
                UserSeason::updateOrCreate(
                    ['season_id' => $active->season_id, 'user_id' => $u->id],
                    [
                        'season_xp'     => $u->season_xp,
                        'season_stars'  => $u->season_stars,
                        'final_rank'    => $rank,
                        'is_champion'   => $isChampion,
                        'snapshot_at'   => $now,
                    ]
                );

                // 2) Store last season info on the user
                User::where('id', $u->id)->update([
                    'last_season_id'   => $active->season_id,
                    'last_season_rank' => $rank,
                ]);

                if ($isChampion) $championUserId = $u->id;
            }

            // 3) Award crown to champion
            if ($championUserId) {
                User::where('id', $championUserId)->increment('crowns', 1);
            }

            // 4) Reset live season counters
            User::query()->update([
                'season_xp'    => 0,
                'season_stars' => 0,
            ]);

            // 5) Close this season
            $active->update(['is_active' => false]);

            // 6) Create the next season (90 days)
            $this->createNextSeason($active, $now);
        });

        $this->info('Season rollover complete.');
        return self::SUCCESS;
    }

    private function createNextSeason(?Season $prev, Carbon $from): void
    {
        $start = $from->copy();
        $end   = $from->copy()->addDays(90); // 90-day season

        // Determine next code/index
        $count = Season::count();
        $num   = $count + 1;
        Season::create([
            'code'      => 'S'.$num,
            'name'      => 'Season '.$num,
            'starts_at' => $start,
            'ends_at'   => $end,
            'is_active' => true,
        ]);
    }
}
