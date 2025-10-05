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
    $q = \App\Models\Challenge1v1::query();

    // ✅ language filter (ignore 'all')
    if ($request->filled('language') && strtolower($request->language) !== 'all') {
        $q->where('language', $request->language);
    }

    // ✅ difficulty filter (ignore 'all')
    if ($request->filled('difficulty') && strtolower($request->difficulty) !== 'all') {
        $q->where('difficulty', $request->difficulty);
    }

    // ✅ search (respects filters)
    if ($request->filled('search')) {
        $term = trim($request->search);
        $q->where(function ($sub) use ($term) {
            $sub->where('title', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }

    // ✅ exclude challenges already taken by current user
    if ($request->boolean('exclude_taken') && auth()->check()) {
        $taken = \App\Models\Duel::where(function ($w) {
            $w->where('challenger_id', auth()->id())
              ->orWhere('opponent_id', auth()->id());
        })->pluck('challenge_id')->toArray();

        if (!empty($taken)) {
            $q->whereNotIn('id', $taken);
        }
    }

    // ✅ exclude challenges taken by opponent (if any)
    if ($request->filled('opponent_id')) {
        $oppTaken = \App\Models\Duel::where(function ($w) use ($request) {
            $w->where('challenger_id', $request->opponent_id)
              ->orWhere('opponent_id', $request->opponent_id);
        })->pluck('challenge_id')->toArray();

        if (!empty($oppTaken)) {
            $q->whereNotIn('id', $oppTaken);
        }
    }

    // ✅ get all filtered challenges
    $challenges = $q->orderBy('created_at', 'desc')->get();

    return response()->json([
        'success' => true,
        'data' => $challenges,
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
