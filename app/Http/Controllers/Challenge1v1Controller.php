<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Challenge1v1;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Duel;

class Challenge1v1Controller extends Controller
{
public function index(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
    }

    // --- sanitize inputs
    $language   = $request->string('language')->toString();
    $difficulty = $request->string('difficulty')->toString();
    $search     = trim((string)$request->get('search', ''));
    $oppId      = $request->has('opponent_id') ? (int)$request->get('opponent_id') : null;

    // default: exclude taken
    $excludeTaken = $request->boolean('exclude_taken', true);

    // --- base query
    $q = Challenge1v1::query();

    // language filter (python|java|cpp)
    if ($language && $language !== 'all') {
        $q->where('language', $language);
    }

    // difficulty filter (easy|medium|hard)
    if ($difficulty && $difficulty !== 'all') {
        $q->where('difficulty', $difficulty);
    }

    // search filter (title + description)
    if ($search !== '') {
        $q->where(function ($w) use ($search) {
            $w->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // --- strict exclusion via duels.challenge_id (participation only)
    if ($excludeTaken) {
        $uid = (int)$user->id;

        // challenges current user has been involved in (challenger or opponent)
        $userTaken = Duel::query()
            ->whereNotNull('challenge_id')
            ->where(function ($w) use ($uid) {
                $w->where('challenger_id', $uid)
                  ->orWhere('opponent_id', $uid);
            })
            ->pluck('challenge_id')
            ->all();

        $excludeIds = $userTaken;

        // optionally also exclude opponent's taken challenges
        if (!empty($oppId)) {
            $oppTaken = Duel::query()
                ->whereNotNull('challenge_id')
                ->where(function ($w) use ($oppId) {
                    $w->where('challenger_id', $oppId)
                      ->orWhere('opponent_id', $oppId);
                })
                ->pluck('challenge_id')
                ->all();

            $excludeIds = array_unique(array_merge($excludeIds, $oppTaken));
        }

        if (!empty($excludeIds)) {
            $q->whereNotIn('id', $excludeIds);
        }
    }

    // sort newest first; cap the list (adjust as you like or paginate)
    $rows = $q->orderByDesc('created_at')
              ->take(30)
              ->get([
                  'id', 'title', 'description', 'language', 'difficulty',
                  'buggy_code', 'fixed_code', 'created_at'
              ]);

    return response()->json([
        'success' => true,
        'data'    => $rows,
    ]);
}
    // Admin JSON import (array of items)
    public function import(Request $request)
    {
        $data = $request->validate([
            // ⬇️ add cpp
            'language'    => 'required|in:python,java,cpp',
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
                // ⬇️ add cpp
                'languages'    => ['python','java','cpp'],
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
                // ⬇️ add cpp
                'languages'    => ['python','java','cpp'],
                'difficulties' => ['easy','medium','hard'],
            ],
        ]);
    }

    // optional for Download button
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
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            // ⬇️ add cpp
            'language'    => 'required|in:python,java,cpp',
            'difficulty'  => 'required|in:easy,medium,hard',
            'buggy_code'  => 'nullable|string',
            'fixed_code'  => 'nullable|string',
        ]);

        $challenge = \App\Models\Challenge1v1::create($data);

        return response()->json(['success' => true, 'data' => $challenge]);
    }

    public function update(Request $request, $id)
    {
        $challenge = \App\Models\Challenge1v1::findOrFail($id);

        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            // ⬇️ add cpp
            'language'    => 'sometimes|in:python,java,cpp',
            'difficulty'  => 'sometimes|in:easy,medium,hard',
            'buggy_code'  => 'nullable|string',
            'fixed_code'  => 'nullable|string',
        ]);

        $challenge->update($data);

        return response()->json(['success' => true, 'data' => $challenge]);
    }
}
