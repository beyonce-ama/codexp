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
    $userId   = auth()->id();
    $oppId    = (int) $request->input('opponent_id', 0);
    $exclude  = filter_var($request->input('exclude_taken', false), FILTER_VALIDATE_BOOLEAN);

    // ——— Build exclusion list from duels (no joins/aliases in the pluck) ———
    // We exclude any challenge that the current user OR the selected opponent has
    // ever participated in (regardless of duel status).
    $takenIds = collect();

    if ($exclude) {
        $takenQuery = \DB::table('duels')
            ->whereNotNull('challenge_id')
            ->where(function ($q) use ($userId, $oppId) {
                $q->where('challenger_id', $userId)
                  ->orWhere('opponent_id', $userId);

                if ($oppId > 0) {
                    $q->orWhere('challenger_id', $oppId)
                      ->orWhere('opponent_id', $oppId);
                }
            })
            ->distinct();

        // IMPORTANT: pluck the plain column name (not aliased)
        $takenIds = $takenQuery->pluck('challenge_id');
    }

    // ——— Base query on challenges_1v1 ———
    $query = \App\Models\Challenge1v1::query();

    // language filter
    $language = $request->input('language');
    if ($language && $language !== 'all') {
        $query->where('language', $language);
    }

    // difficulty filter
    $difficulty = $request->input('difficulty');
    if ($difficulty && $difficulty !== 'all') {
        $query->where('difficulty', $difficulty);
    }

    // search by title
    $search = trim((string) $request->input('search', ''));
    if ($search !== '') {
        $query->where('title', 'like', "%{$search}%");
    }

    // exclude taken challenge IDs (current user and optional opponent)
    if ($exclude && $takenIds->isNotEmpty()) {
        $query->whereNotIn('id', $takenIds->all());
    }

    // You can paginate or return all; your frontend expects array or {data:[]}
    $results = $query
        ->orderByDesc('created_at')
        ->limit(100) // optional safety cap
        ->get();

    return response()->json([
        'success' => true,
        'data'    => $results,
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
