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
    $user = auth()->user();
    $q = \App\Models\Challenge1v1::query();

    // ✅ Apply filters (language, difficulty, search)
    if ($request->filled('language') && strtolower($request->language) !== 'all') {
        $q->where('language', $request->language);
    }

    if ($request->filled('difficulty') && strtolower($request->difficulty) !== 'all') {
        $q->where('difficulty', $request->difficulty);
    }

    if ($request->filled('search')) {
        $term = trim($request->search);
        $q->where(function ($sub) use ($term) {
            $sub->where('title', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }

    // ✅ Exclude challenges the current user has already taken
    if ($user) {
        $takenIds = \App\Models\Duel::where(function ($duel) use ($user) {
                $duel->where('challenger_id', $user->id)
                     ->orWhere('opponent_id', $user->id);
            })
            ->pluck('challenge_id') // ← real column name
            ->unique()
            ->toArray();

        if (!empty($takenIds)) {
            $q->whereNotIn('id', $takenIds);
        }
    }

    // ✅ Get all remaining challenges (untaken)
    $challenges = $q->orderByDesc('created_at')->get();

    return response()->json([
        'success' => true,
        'data' => $challenges,
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
