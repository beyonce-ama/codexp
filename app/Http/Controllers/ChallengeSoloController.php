<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChallengeSolo;
use Illuminate\Http\Request;
use Inertia\Inertia;


class ChallengeSoloController extends Controller
{
    public function index(Request $request)
{
    $q = ChallengeSolo::query();

   if ($request->filled('mode') && $request->mode !== 'all') {
    $q->where('mode', $request->mode);
}
if ($request->filled('language') && $request->language !== 'all') {
    $q->where('language', $request->language);
}
if ($request->filled('difficulty') && $request->difficulty !== 'all') {
    $q->where('difficulty', $request->difficulty);
}


    // NEW: search by title or description
    if ($request->filled('search')) {
        $term = trim($request->input('search'));
        $q->where(function($qq) use ($term) {
            $qq->where('title', 'LIKE', "%{$term}%")
               ->orWhere('description', 'LIKE', "%{$term}%");
        });
    }

    return response()->json(['success'=>true,'data'=>$q->latest()->paginate(20)]);
}

    // Admin JSON import (array of items)
    public function import(Request $request)
    {
        $data = $request->validate([
            'mode'        => 'required|in:fixbugs,random',
            'language'    => 'required|in:python,java,cpp', 
            'difficulty'  => 'required|in:easy,medium,hard',
            'source_file' => 'nullable|string',
            'items'       => 'required|array'
        ]);

        $created = [];
        foreach ($data['items'] as $item) {
            $created[] = ChallengeSolo::create([
                'mode'        => $data['mode'],
                'language'    => $data['language'],
                'difficulty'  => $data['difficulty'],
                'title'       => $item['title'] ?? 'Untitled',
                'description' => $item['description'] ?? null,
                'buggy_code'  => $item['buggy_code'] ?? null,
                'fixed_code'  => $item['fixed_code'] ?? null,
                'hint'        => $item['hint'] ?? null,
                'payload_json'=> $item,
                'source_file' => $data['source_file'] ?? null,
                'reward_xp'   => ($data['mode']==='random') ? 3.50 : 2.00,
            ]);
        }

        return response()->json(['success'=>true,'count'=>count($created),'data'=>$created], 201);
    }
    

public function store(Request $request)
{
    try {
        $data = $request->validate([
            'language' => 'required|string',
            'difficulty' => 'required|string',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'buggy_code' => 'nullable|string',
            'fixed_code' => 'nullable|string',
            'hint' => 'nullable|string',
            'mode' => 'nullable|string',
            'reward_xp' => 'nullable|integer',
        ]);

        $challenge = \App\Models\ChallengeSolo::create([
            ...$data,
            'reward_xp' => $data['reward_xp'] ?? 0,
            'payload_json' => json_encode($data),
            'source_file' => 'manual_create',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Challenge created successfully',
            'data' => $challenge,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create challenge: ' . $e->getMessage(),
        ], 500);
    }
}


public function update(Request $request, $id)
{
    $challenge = \App\Models\ChallengeSolo::findOrFail($id);

    $data = $request->validate([
        'title' => 'sometimes|string|max:255',
        'description' => 'nullable|string',
        'language' => 'sometimes|in:python,java,cpp',
        'difficulty' => 'sometimes|in:easy,medium,hard',
        'buggy_code' => 'nullable|string',
        'fixed_code' => 'nullable|string',
        'mode' => 'sometimes|in:fixbugs',
        'hint' => 'nullable|string',
        'reward_xp' => 'nullable|numeric',
    ]);

    $challenge->update($data);

    return response()->json(['success' => true, 'data' => $challenge]);
}


    public function destroy(int $id)
    {
        ChallengeSolo::findOrFail($id)->delete();
        return response()->json(['success'=>true]);
    }
    public function create()
    {
        return Inertia::render('Admin/Challenges', [
            'adminMode'  => 'create',
            'activeType' => 'solo',
            // you can pass dropdown meta if you’ll use it:
           'meta' => [
                'languages' => ['python','java','cpp'], // ← added cpp
                'difficulties' => ['easy','medium','hard'],
                'modes' => ['fixbugs'],
            ],

        ]);
    }

    public function show(\App\Models\ChallengeSolo $challenge)
    {
        return Inertia::render('Admin/Challenges', [
            'adminMode'  => 'view',
            'activeType' => 'solo',
            'challenge'  => $challenge,
        ]);
    }

    public function edit(\App\Models\ChallengeSolo $challenge)
    {
        return Inertia::render('Admin/Challenges', [
            'adminMode'  => 'edit',
            'activeType' => 'solo',
            'challenge'  => $challenge,
            'meta' => [
                'languages' => ['python','java','cpp'],
                'difficulties' => ['easy','medium','hard'],
                'modes' => ['fixbugs'],
            ],
        ]);
    }

// optional for Download button
    public function export(\App\Models\ChallengeSolo $challenge)
    {
        return response()->json($challenge->only([
            'id','mode','language','difficulty','title','description',
            'buggy_code','fixed_code','hint','payload_json','source_file',
            'reward_xp','created_at','updated_at'
        ]));
    }

}
