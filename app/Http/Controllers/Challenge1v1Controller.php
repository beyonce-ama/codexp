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
    $userId    = auth()->id();
    $oppId     = (int) $request->input('opponent_id', 0);
    $language  = (string) $request->input('language', 'all');
    $difficulty= (string) $request->input('difficulty', 'all');
    $search    = trim((string) $request->input('search', ''));
    $exclude   = filter_var($request->input('exclude_taken', true), FILTER_VALIDATE_BOOLEAN);

    $q = Challenge1v1::query();

    // --- Exclude any challenge already taken by me or the chosen opponent ---
    if ($exclude) {
        $q->whereNotExists(function ($sub) use ($userId, $oppId) {
            $sub->select(DB::raw(1))
                ->from('duels as d')
                ->whereColumn('d.challenge_id', 'challenges_1v1.id')
                ->where(function ($w) use ($userId, $oppId) {
                    $w->where('d.challenger_id', $userId)
                      ->orWhere('d.opponent_id', $userId);

                    if ($oppId > 0) {
                        $w->orWhere('d.challenger_id', $oppId)
                          ->orWhere('d.opponent_id', $oppId);
                    }
                });
        });
    }

    // --- Filters ---
    if ($language !== '' && $language !== 'all') {
        $q->where('language', $language);
    }
    if ($difficulty !== '' && $difficulty !== 'all') {
        $q->where('difficulty', $difficulty);
    }

    // --- Search (GROUPED!) so it doesn't break the exclusion logic ---
    if ($search !== '') {
        $q->where(function ($g) use ($search) {
            $g->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    $items = $q->orderByDesc('created_at')
               ->limit(100) // safety cap
               ->get();

    return response()->json([
        'success' => true,
        'data'    => $items,
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
