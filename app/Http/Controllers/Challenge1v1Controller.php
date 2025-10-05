<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Challenge1v1;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class Challenge1v1Controller extends Controller
{
 public function index(Request $request)
{
    $userId     = auth()->id();
    $oppId      = (int) $request->input('opponent_id', 0);
    $languageIn = strtolower((string) $request->input('language', 'all'));
    $difficulty = strtolower((string) $request->input('difficulty', 'all'));
    $search     = trim((string) $request->input('search', ''));
    $exclude    = filter_var($request->input('exclude_taken', true), FILTER_VALIDATE_BOOLEAN);

    // --- Normalize language: accept aliases and case ---
    // We keep storage canonical as 'python','java','cpp'
    $langSet = null;
    if ($languageIn !== '' && $languageIn !== 'all') {
        if (in_array($languageIn, ['c++','cpp','cplusplus'], true)) {
            $langSet = ['cpp','c++']; // match either in DB
        } else {
            $langSet = [$languageIn];
        }
    }

    $q = \App\Models\Challenge1v1::query();

    // --- Exclude challenges already taken by me or the chosen opponent,
    //     but ONLY if those duels are truly completed/finished.
    if ($exclude && !empty($userId)) {
        $q->whereNotExists(function ($sub) use ($userId, $oppId) {
            $sub->select(DB::raw(1))
                ->from('duels as d')
                ->whereNotNull('d.challenge_id')
                ->whereColumn('d.challenge_id', 'challenges_1v1.id')
                ->where(function ($w) use ($userId, $oppId) {
                    $w->where('d.challenger_id', $userId)
                      ->orWhere('d.opponent_id', $userId);

                    if ($oppId > 0) {
                        $w->orWhere('d.challenger_id', $oppId)
                          ->orWhere('d.opponent_id', $oppId);
                    }
                })
                // 🚦 Only treat as "taken" when clearly done.
                // Adjust the statuses to your real values if different.
                ->where(function ($w) {
                    $w->whereIn('d.status', ['finished','completed','ended','closed','decided'])
                      ->orWhereNotNull('d.winner_id');
                });
        });
    }

    // --- Language filter (case-insensitive; supports aliases)
    if (is_array($langSet) && !empty($langSet)) {
        $q->where(function ($w) use ($langSet) {
            foreach ($langSet as $i => $code) {
                $method = $i === 0 ? 'whereRaw' : 'orWhereRaw';
                $w->{$method}('LOWER(language) = ?', [strtolower($code)]);
            }
        });
    }

    // --- Difficulty filter (case-insensitive)
    if ($difficulty !== '' && $difficulty !== 'all') {
        $q->whereRaw('LOWER(difficulty) = ?', [$difficulty]);
    }

    // --- Search (grouped, safe)
    if ($search !== '') {
        $q->where(function ($g) use ($search) {
            $g->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    $items = $q->orderByDesc('created_at')
               ->limit(300)  // bump cap so "All" can show everything
               ->get();

    // Optional: normalize outbound language strings for the UI
    $items->transform(function ($row) {
        $lang = strtolower((string)($row->language ?? ''));
        if ($lang === 'c++') $lang = 'cpp';  // present uniformly
        $row->language = $lang;
        $row->difficulty = strtolower((string)($row->difficulty ?? ''));
        return $row;
    });

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
