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

    public function history(Request $request)
{
    $user = $request->user();
    $limit = max(1, min(50, (int)$request->input('limit', 20)));

    // Get only LIVE matches for this user
    $duels = \App\Models\DuelTaken::query()
        ->where('user_id', $user->id)
        ->where('source', 'live') // ← only live
        ->orderByDesc('id')
        ->limit($limit)
        ->with(['match:id,public_id,language,difficulty,challenge_json,payload,status'])
        ->get();

    // Collect all match_ids
    $matchIds = $duels->pluck('match_id')->filter()->unique()->values();

    // Fetch other players from the same matches (the opponents)
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

    // Helper: decode challenge from JSON text or array
    $decodeChallenge = function ($match) {
        if (!$match) return null;
        $raw = $match->challenge_json ?? $match->payload ?? null;

        // Already array?
        if (is_array($raw)) {
            return $raw['challenge'] ?? $raw;
        }

        // Decode if string
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                // handle nested {"challenge": {...}}
                return $decoded['challenge'] ?? $decoded;
            }
        }

        return null;
    };

    // Build final list
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
            'challenge'       => $challenge, // always returned
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

        // Validate only these fields; mode is fixed server-side.
       $data = $r->validate([
            'language'   => 'required|in:python,java,cpp',
            'difficulty' => 'required|in:easy,medium,hard',
            'resume'     => 'sometimes|boolean',
        ]);

        $mode = 'aigenerated';

        // === Optional resume: only if I already have a token for an ACTIVE match ===
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

        // === Ensure my queue ticket exists (and is up-to-date) ===
        $searchHasMode = Schema::hasColumn('match_searches', 'mode');
        $update = [
            'status'     => 'searching',
            'language'   => $data['language'],
            'difficulty' => $data['difficulty'],
            'updated_at' => now(),
            'created_at' => now(),
        ];
        if ($searchHasMode) {
            $update['mode'] = $mode;
        }

        // This guarantees a row exists for me.
        DB::table('match_searches')->updateOrInsert(['user_id' => $u->id], $update);

        // === Try to pick an opponent atomically & decide a single creator ===
        $pair = DB::transaction(function () use ($u, $data, $searchHasMode, $mode) {
            $q = DB::table('match_searches')
                ->where('status', 'searching')
                ->where('user_id', '<>', $u->id)
                ->where('language', $data['language'])
                ->where('difficulty', $data['difficulty'])
                ->when($searchHasMode, fn ($qq) => $qq->where('mode', $mode))
                ->orderBy('id', 'asc')
                ->lockForUpdate()
                ->first();

            if (!$q) {
                return null;
            }

            // Remove both tickets from queue
            DB::table('match_searches')->whereIn('user_id', [$u->id, $q->user_id])->delete();

            $opp = (int) $q->user_id;
            return ['opponent' => $opp, 'creator' => min($u->id, $opp)];
        });

        if (!$pair) {
            // Nobody else yet; frontend will continue polling.
            return response()->json(['queued' => true]);
        }

        // === Non-creator: briefly wait for the creator to finish, then return slug+token ===
        if ($u->id !== $pair['creator']) {
            $hasJoinSecret = Schema::hasColumn('match_participants', 'join_secret');

            $deadline = microtime(true) + 4.5; // up to ~4.5s
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

                usleep(250_000); // 250ms
            } while (microtime(true) < $deadline);

            // Creator is still building the match; frontend keeps polling.
            return response()->json(['paired' => true]);
        }

        // === Creator: create match, tokens, challenge; then return slug+my token ===
        $result = DB::transaction(function () use ($u, $pair, $data) {
            $match = MatchModel::create([
                'language'   => $data['language'],
                'difficulty' => $data['difficulty'],
                'status'     => 'active',
            ]);

            // Ensure slug exists even if model boot didn't set it
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

            // Generate challenge (same path as Solo)
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

        // Let both clients know (frontend also polls as fallback)
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

    /**
     * Poll while searching; returns { slug, token } when assigned.
     */
    public function poll(Request $r)
    {
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

    /** Cancel my search */
    public function cancel(Request $r)
    {
        DB::table('match_searches')->where('user_id', $r->user()->id)->delete();
        return response()->json(['ok' => true]);
    }


}
