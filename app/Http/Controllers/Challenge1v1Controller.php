<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Challenge1v1;
use Illuminate\Http\Request;
use Inertia\Inertia;


class Challenge1v1Controller extends Controller
{
 public function index(Request $request)
{
    $q = \App\Models\Challenge1v1::query();

    // filters already used by the UI
    if ($request->filled('language'))   $q->where('language', $request->language);
    if ($request->filled('difficulty')) $q->where('difficulty', $request->difficulty);

    // optional text search (UI sends `search`)
    if ($request->filled('search')) {
        $term = $request->string('search')->toString();
        $q->where(function ($qq) use ($term) {
            $qq->where('title', 'like', "%{$term}%")
               ->orWhere('description', 'like', "%{$term}%");
        });
    }

    // exclude challenges the CURRENT user has already taken (default = true)
    $excludeTaken = $request->boolean('exclude_taken', true);
    if ($excludeTaken && $request->user()) {
        $uid = $request->user()->id;

        // any duel where THIS user submitted + the duel had a challenge_id
        // (covers finished, surrendered, or still-active where user already answered)
       $takenChallengeIds = \App\Models\Duel::query()
            ->join('duel_submissions as ds', 'ds.duel_id', '=', 'duels.id')
            ->where('ds.user_id', $uid)
            ->whereIn('duels.status', ['finished','surrendered'])
            ->whereNotNull('duels.challenge_id')
            ->distinct()
            ->pluck('duels.challenge_id');

        if ($takenChallengeIds->isNotEmpty()) {
            $q->whereNotIn('id', $takenChallengeIds);
        }
    }
    // Optional: also exclude challenges the intended opponent already took
    if ($request->filled('opponent_id')) {
        $oppId = (int) $request->opponent_id;

        $opponentTakenIds = \App\Models\Duel::query()
            ->join('duel_submissions as ds', 'ds.duel_id', '=', 'duels.id')
            ->where('ds.user_id', $oppId)
            ->whereNotNull('duels.challenge_id')
            ->distinct()
            ->pluck('duels.challenge_id');

        if ($opponentTakenIds->isNotEmpty()) {
            $q->whereNotIn('id', $opponentTakenIds);
        }
    }

    return response()->json([
        'success' => true,
        'data'    => $q->latest()->paginate(20),
    ]);
}

    public function import(Request $request)
    {
        $data = $request->validate([
            'language'    => 'required|in:python,java',
            'difficulty'  => 'required|in:easy,medium,hard',
            'source_file' => 'nullable|string',
            'items'       => 'required|array'
        ]);

        $created = [];
        foreach ($data['items'] as $item) {
            $created[] = Challenge1v1::create([
                'language'    => $data['language'],
                'difficulty'  => $data['difficulty'],
                'title'       => $item['title'] ?? 'Untitled',
                'description' => $item['description'] ?? null,
                'buggy_code'  => $item['buggy_code'] ?? null,
                'fixed_code'  => $item['fixed_code'] ?? null,
                'payload_json'=> $item,
                'source_file' => $data['source_file'] ?? null,
            ]);
        }
        return response()->json(['success'=>true,'count'=>count($created),'data'=>$created], 201);
    }

    public function destroy(int $id)
    {
        Challenge1v1::findOrFail($id)->delete();
        return response()->json(['success'=>true]);
    }
    public function create()
    {
        return Inertia::render('Admin/Challenges', [
            'adminMode'  => 'create',
            'activeType' => '1v1',
            'meta' => [
                'languages' => ['python','java'],
                'difficulties' => ['easy','medium','hard'],
            ],
        ]);
    }

    public function show(\App\Models\Challenge1v1 $challenge)
    {
        return Inertia::render('Admin/Challenges', [
            'adminMode'  => 'view',
            'activeType' => '1v1',
            'challenge'  => $challenge,
        ]);
    }

    public function edit(\App\Models\Challenge1v1 $challenge)
    {
        return Inertia::render('Admin/Challenges', [
            'adminMode'  => 'edit',
            'activeType' => '1v1',
            'challenge'  => $challenge,
            'meta' => [
                'languages' => ['python','java'],
                'difficulties' => ['easy','medium','hard'],
            ],
        ]);
    }

    public function export(\App\Models\Challenge1v1 $challenge)
    {
        return response()->json($challenge->only([
            'id','language','difficulty','title','description',
            'buggy_code','fixed_code','payload_json','source_file',
            'created_at','updated_at'
        ]));
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'language' => 'required|in:python,java',
            'difficulty' => 'required|in:easy,medium,hard',
            'buggy_code' => 'nullable|string',
            'fixed_code' => 'nullable|string',
        ]);

        $challenge = \App\Models\Challenge1v1::create($data);

        return response()->json(['success' => true, 'data' => $challenge]);
    }

    public function update(Request $request, $id)
    {
        $challenge = \App\Models\Challenge1v1::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'language' => 'sometimes|in:python,java',
            'difficulty' => 'sometimes|in:easy,medium,hard',
            'buggy_code' => 'nullable|string',
            'fixed_code' => 'nullable|string',
        ]);

        $challenge->update($data);

        return response()->json(['success' => true, 'data' => $challenge]);
    }


}
