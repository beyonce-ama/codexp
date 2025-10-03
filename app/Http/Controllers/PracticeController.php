<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PracticeController extends Controller
{
    // Find the next not-finished set for this language; fall back to the lowest set_index.
    protected function getCurrentSetForUser(int $userId, string $language)
    {
        $sets = DB::table('question_sets')
            ->where('language', $language)
            ->where('is_active', 1)
            ->orderBy('set_index')
            ->get();

        if ($sets->isEmpty()) return null;

        // Map set_id => finished?
        $progress = DB::table('user_practice_progress')
            ->where('user_id', $userId)
            ->whereIn('question_set_id', $sets->pluck('id'))
            ->get()
            ->keyBy('question_set_id');

        // pick first not-finished; else the highest set (last one)
        foreach ($sets as $set) {
            $row = $progress->get($set->id);
            if (!$row || (int)$row->finished === 0) {
                return [$set, $row];
            }
        }
        // all finished -> stay on last (or return null to block)
        $last = $sets->last();
        return [$last, $progress->get($last->id)];
    }

    public function current(Request $request)
    {
        $user = $request->user();
        $language = $request->query('language', 'python');

        [$set, $prog] = $this->getCurrentSetForUser($user->id, $language) ?? [null, null];
        if (!$set) {
            return response()->json(['success' => false, 'message' => 'No sets defined'], 404);
        }

        $taken = $prog ? json_decode($prog->taken_ids_json ?: '[]', true) : [];
        return response()->json([
            'success' => true,
            'set' => [
                'id' => $set->id,
                'language' => $set->language,
                'set_index' => $set->set_index,
                'filename' => $set->filename,
                'total_questions' => $set->total_questions,
            ],
            'progress' => [
                'taken_ids' => $taken,
                'taken_count' => (int)($prog->taken_count ?? 0),
                'finished' => (bool)($prog->finished ?? 0),
            ],
        ]);
    }

    public function markTaken(Request $request)
    {
        $request->validate([
            'question_set_id' => 'required|integer',
            'question_id'     => 'required|integer',
        ]);
        $user = $request->user();
        $setId = (int)$request->input('question_set_id');
        $qid   = (int)$request->input('question_id');

        $set = DB::table('question_sets')->where('id', $setId)->first();
        if (!$set) return response()->json(['success'=>false,'message'=>'Set not found'], 404);

        $row = DB::table('user_practice_progress')
            ->where('user_id', $user->id)
            ->where('question_set_id', $setId)
            ->lockForUpdate()
            ->first();

        if (!$row) {
            $taken = [$qid];
            DB::table('user_practice_progress')->insert([
                'user_id' => $user->id,
                'question_set_id' => $setId,
                'taken_ids_json' => json_encode($taken),
                'taken_count' => 1,
                'last_question_id' => $qid,
                'finished' => (count($taken) >= $set->total_questions) ? 1 : 0,
                'finished_at' => (count($taken) >= $set->total_questions) ? now() : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $taken = json_decode($row->taken_ids_json ?: '[]', true);
            if (!in_array($qid, $taken, true)) $taken[] = $qid;
            $finished = (count($taken) >= $set->total_questions) ? 1 : 0;

            DB::table('user_practice_progress')
              ->where('id', $row->id)
              ->update([
                'taken_ids_json' => json_encode($taken),
                'taken_count' => count($taken),
                'last_question_id' => $qid,
                'finished' => $finished,
                'finished_at' => $finished ? now() : null,
                'updated_at' => now(),
              ]);
        }

        return response()->json(['success'=>true]);
    }

    public function finishSet(Request $request)
    {
        $request->validate([
            'question_set_id' => 'required|integer'
        ]);
        $user = $request->user();
        $setId = (int)$request->input('question_set_id');

        $row = DB::table('user_practice_progress')
            ->where('user_id', $user->id)
            ->where('question_set_id', $setId)
            ->first();

        if (!$row) return response()->json(['success'=>false,'message'=>'Progress not found'], 404);

        DB::table('user_practice_progress')
          ->where('id', $row->id)
          ->update(['finished'=>1, 'finished_at'=>now(), 'updated_at'=>now()]);

        return response()->json(['success'=>true]);
    }

    public function listSets(Request $request)
    {
        $user = $request->user();
        $language = $request->query('language', 'python');

        $sets = DB::table('question_sets')
            ->where('language', $language)
            ->where('is_active', 1)
            ->orderBy('set_index')->get();

        $progress = DB::table('user_practice_progress')
            ->where('user_id', $user->id)
            ->whereIn('question_set_id', $sets->pluck('id'))
            ->get()
            ->keyBy('question_set_id');

        $data = $sets->map(function($s) use ($progress) {
            $p = $progress->get($s->id);
            return [
                'id' => $s->id,
                'set_index' => $s->set_index,
                'filename' => $s->filename,
                'total_questions' => $s->total_questions,
                'finished' => (bool)($p->finished ?? 0),
                'taken_count' => (int)($p->taken_count ?? 0),
            ];
        });

        return response()->json(['success'=>true, 'sets'=>$data]);
    }
}
