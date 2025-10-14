<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Events\MatchFound;
use App\Models\MatchModel;
use App\Models\MatchParticipant;

class MatchmakingController extends Controller
{
    /**
     * Remove stale/expired queue tickets.
     * - If heartbeat/expires columns exist, use them.
     * - Otherwise, fall back to updated_at older than 2 minutes.
     */
    private function sweepStale(): void
    {
        $hasHeartbeat = Schema::hasColumn('match_searches', 'heartbeat_at');
        $hasExpires   = Schema::hasColumn('match_searches', 'expires_at');

        $now = now();

        DB::table('match_searches')
            ->when($hasHeartbeat, fn ($q) => $q->orWhere('heartbeat_at', '<', $now->clone()->subSeconds(20)))
            ->when($hasExpires,   fn ($q) => $q->orWhere('expires_at', '<=', $now))
            ->when(!$hasHeartbeat && !$hasExpires, fn ($q) => $q->orWhere('updated_at', '<', $now->clone()->subMinutes(2)))
            ->delete();
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $limit = max(1, min(50, (int)$request->input('limit', 20)));

        $duels = \App\Models\DuelTaken::query()
            ->where('user_id', $user->id)
            ->where('source', 'live')
            ->orderByDesc('id')
            ->limit($limit)
            ->with(['match:id,public_id,language,difficulty,challenge_json,payload,status'])
            ->get();

        $matchIds = $duels->pluck('match_id')->filter()->unique()->values();

        $opponents = [];
        if ($matchIds->isNotEmpty()) {
            $rows = \App\Models\DuelTaken::query()
                ->select(['duels_taken.match_id', 'duels_taken.user_id', 'users.name'])
                ->join('users', 'users.id', '=', 'duels_taken.user_id')
                ->whereIn('duels_taken.match_id', $matchIds)
                ->where('duels_taken.user_id', '!=', $user->id)
                ->get();

            foreach ($rows as $r) {
                $opponents[$r->match_id] = ['id' => $r->user_id, 'name' => $r->name];
            }
        }

        $decodeChallenge = function ($match) {
            if (!$match) return null;
            $raw = $match->challenge_json ?? $match->payload ?? null;

            if (is_array($raw)) {
                return $raw['challenge'] ?? $raw;
            }

            if (is_string($raw) && $raw !== '') {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    return $decoded['challenge'] ?? $decoded;
                }
            }

            return null;
        };

        $items = $duels->map(function ($d) use ($user, $opponents, $decodeChallenge) {
            $match = $d->match;
            $opponent = $opponents[$d->match_id] ?? ['id' => null, 'name' => 'Unknown'];
            $challenge = $decodeChallenge($match);

            return [
                'id'              => $d->id,
                'duel_id'         => $d->duel_id,
                'match_id'        => $d->match_id,
                'match_public_id' => $match?->public_id,
                'language'        => $match?->language ?? $d->language,
                'difficulty'      => $match?->difficulty ?? null,
                'status'          => $d->status,
                'is_winner'       => (bool)$d->is_winner,
                'time_spent_sec'  => $d->time_spent_sec,
                'finished_at'     => optional($d->ended_at)->toIso8601String(),
                'challenge'       => $challenge,
                'opponent'        => $opponent,
            ];
        });

        return response()->json(['items' => $items]);
    }

    /**
     * Join matchmaking: queue, try to pair, create match, generate challenge,
     * and return { slug, token } when ready. Mode is fixed to "aigenerated".
     */
    public function join(Request $r)
    {
        $u = $r->user();

        $data = $r->validate([
            'language'   => 'required|in:python,java,cpp',
            'difficulty' => 'required|in:easy,medium,hard',
            'resume'     => 'sometimes|boolean',
        ]);

        $mode = 'aigenerated';

        // === Resume existing match if still active
        if ($data['resume'] ?? false) {
            $mp = MatchParticipant::query()
                ->where('user_id', $u->id)
                ->when(Schema::hasColumn('match_participants', 'join_secret'), fn ($q) => $q->whereNotNull('join_secret'))
                ->whereHas('match', fn ($q) => $q->where('status', 'active'))
                ->latest('id')
                ->first();

            if ($mp) {
                $slug = MatchModel::where('id', $mp->match_id)->value('public_id');
                return response()->json(['slug' => $slug, 'token' => $mp->join_secret ?? null]);
            }
        }

        $searchHasMode = Schema::hasColumn('match_searches', 'mode');
        $hasHeartbeat  = Schema::hasColumn('match_searches', 'heartbeat_at');
        $hasExpires    = Schema::hasColumn('match_searches', 'expires_at');

        $now = now();
        $ttl = 120;
        $aliveWindow = 15;

        $this->sweepStale();

        $update = [
            'status'     => 'searching',
            'language'   => $data['language'],
            'difficulty' => $data['difficulty'],
            'updated_at' => $now,
            'created_at' => $now,
        ];
        if ($searchHasMode) $update['mode'] = $mode;
        if ($hasHeartbeat)  $update['heartbeat_at'] = $now;
        if ($hasExpires)    $update['expires_at'] = $now->clone()->addSeconds($ttl);

        DB::table('match_searches')->updateOrInsert(['user_id' => $u->id], $update);

        // 🧠 FIXED: atomic opponent selection (prevents both joining same-time and missing each other)
        $pair = DB::transaction(function () use ($u, $data, $searchHasMode, $mode, $hasHeartbeat, $hasExpires, $now, $aliveWindow) {
            // Lock the table segment for this language/difficulty
            DB::table('match_searches')
                ->where('language', $data['language'])
                ->where('difficulty', $data['difficulty'])
                ->lockForUpdate()
                ->get();

            $q = DB::table('match_searches')
                ->where('status', 'searching')
                ->where('user_id', '<>', $u->id)
                ->where('language', $data['language'])
                ->where('difficulty', $data['difficulty'])
                ->when($searchHasMode, fn ($qq) => $qq->where('mode', $mode))
                ->when($hasHeartbeat, fn ($qq) => $qq->where('heartbeat_at', '>=', $now->clone()->subSeconds($aliveWindow)))
                ->when($hasExpires,   fn ($qq) => $qq->where('expires_at', '>', $now))
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$q) {
                return null;
            }

            DB::table('match_searches')->whereIn('user_id', [$u->id, $q->user_id])->delete();

            $opp = (int) $q->user_id;
            return ['opponent' => $opp, 'creator' => min($u->id, $opp)];
        });

        if (!$pair) {
            return response()->json(['queued' => true]);
        }

        if ($u->id !== $pair['creator']) {
            $hasJoinSecret = Schema::hasColumn('match_participants', 'join_secret');
            $deadline = microtime(true) + 4.5;

            do {
                $mp = MatchParticipant::query()
                    ->where('user_id', $u->id)
                    ->when($hasJoinSecret, fn ($q) => $q->whereNotNull('join_secret'))
                    ->whereHas('match', fn ($q) =>
                        $q->where('status', 'active')
                          ->where('created_at', '>=', now()->subMinutes(2))
                    )
                    ->latest('id')
                    ->first();

                if ($mp) {
                    $m = MatchModel::find($mp->match_id);
                    if ($m && empty($m->public_id)) {
                        $m->public_id = (string) Str::uuid();
                        $m->save();
                    }
                    if ($m) {
                        return response()->json([
                            'slug'  => $m->public_id,
                            'token' => $hasJoinSecret ? $mp->join_secret : null,
                        ]);
                    }
                }

                usleep(250_000);
            } while (microtime(true) < $deadline);

            return response()->json(['paired' => true]);
        }

        $result = DB::transaction(function () use ($u, $pair, $data) {
            $match = MatchModel::create([
                'language'   => $data['language'],
                'difficulty' => $data['difficulty'],
                'status'     => 'active',
            ]);

            if (empty($match->public_id)) {
                $match->public_id = (string) Str::uuid();
                $match->save();
            }

            $hasJoinSecret = Schema::hasColumn('match_participants', 'join_secret');
            $myToken  = $hasJoinSecret ? Str::random(32) : null;
            $oppToken = $hasJoinSecret ? Str::random(32) : null;

            $meAttrs = ['match_id' => $match->id, 'user_id' => $u->id];
            $opAttrs = ['match_id' => $match->id, 'user_id' => $pair['opponent']];
            if ($hasJoinSecret) {
                $meAttrs['join_secret'] = $myToken;
                $opAttrs['join_secret'] = $oppToken;
            }

            MatchParticipant::create($meAttrs);
            MatchParticipant::create($opAttrs);

            $svc = app(\App\Services\AzureOpenAIService::class);
            $raw = $svc->generateChallenge($data['language'], $data['difficulty'], null);

            $challenge = [
                'title'          => $raw['title'] ?? "Fix the Bug: {$data['language']} ({$data['difficulty']})",
                'description'    => $raw['description'] ?? 'Repair the function to satisfy all tests.',
                'language'       => $data['language'],
                'difficulty'     => $data['difficulty'],
                'buggy_code'     => $raw['buggy_code'] ?? '',
                'fixed_code'     => $raw['fixed_code'] ?? ($raw['corrected_code'] ?? ''),
                'corrected_code' => $raw['corrected_code'] ?? ($raw['fixed_code'] ?? ''),
                'tests'          => is_array($raw['tests'] ?? null) ? $raw['tests'] : [],
                'hint'           => $raw['hint'] ?? null,
                'explanation'    => $raw['explanation'] ?? null,
            ];

            $match->challenge_json = json_encode(['challenge' => $challenge], JSON_UNESCAPED_UNICODE);
            $match->save();

            return [
                'match_id' => $match->id,
                'slug'     => $match->public_id,
                'my_token' => $myToken,
                'opp_id'   => $pair['opponent'],
            ];
        });

        event(new MatchFound(
            match_id: $result['match_id'],
            participants: [(int) $u->id, (int) $result['opp_id']],
            language: $data['language'],
            difficulty: $data['difficulty']
        ));

        return response()->json([
            'slug'  => $result['slug'],
            'token' => $result['my_token'],
        ]);
    }

    public function poll(Request $r)
    {
        $this->sweepStale();

        $u = $r->user();
        $hasJoinSecret = Schema::hasColumn('match_participants', 'join_secret');

        $mp = MatchParticipant::query()
            ->where('user_id', $u->id)
            ->when($hasJoinSecret, fn ($q) => $q->whereNotNull('join_secret'))
            ->whereHas('match', fn ($q) =>
                $q->where('status', 'active')
                  ->where('created_at', '>=', now()->subMinutes(10))
            )
            ->latest('id')
            ->first();

        if (!$mp) {
            return response()->json(['slug' => null]);
        }

        $m = MatchModel::find($mp->match_id);
        if ($m && empty($m->public_id)) {
            $m->public_id = (string) Str::uuid();
            $m->save();
        }

        return response()->json([
            'slug'  => $m?->public_id,
            'token' => $hasJoinSecret ? $mp->join_secret : null,
        ]);
    }

    public function cancel(Request $r)
    {
        DB::table('match_searches')->where('user_id', $r->user()->id)->delete();
        $this->sweepStale();
        return response()->json(['ok' => true]);
    }

    /** Client pings this every ~8s while searching to prove liveness */
    public function heartbeat(Request $r)
    {
        $u = $r->user();

        $hasHeartbeat = Schema::hasColumn('match_searches', 'heartbeat_at');
        $hasExpires   = Schema::hasColumn('match_searches', 'expires_at');

        if (!$hasHeartbeat && !$hasExpires) {
            DB::table('match_searches')
                ->where('user_id', $u->id)
                ->update(['updated_at' => now()]);
            return response()->json(['ok' => true, 'fallback' => true]);
        }

        $now = now();
        $ttl = 120;

        DB::table('match_searches')
            ->where('user_id', $u->id)
            ->update(array_filter([
                'heartbeat_at' => $hasHeartbeat ? $now : null,
                'expires_at'   => $hasExpires ? $now->clone()->addSeconds($ttl) : null,
                'updated_at'   => $now,
            ], fn ($v) => $v !== null));

        return response()->json(['ok' => true]);
    }
}
