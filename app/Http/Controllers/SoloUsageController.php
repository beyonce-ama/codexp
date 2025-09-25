<?php

namespace App\Http\Controllers;

use App\Models\SoloTaken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SoloUsageController extends Controller
{
    // POST /api/solo/mark-taken
    public function markTaken(Request $req)
    {
        $rules = [
            'language'        => ['nullable', Rule::in(['python','java'])],
            'difficulty'      => ['nullable', Rule::in(['easy','medium','hard'])],
            'mode'            => ['required', Rule::in(['fixbugs','random','aigenerated'])],
            'status'          => ['required', Rule::in(['viewed','started','abandoned','completed','submitted_incorrect'])],
            'time_spent_sec'  => ['nullable','integer','min:0'],
            'earned_xp'       => ['nullable','integer','min:0'],
            'code_submitted'  => ['nullable','string'],
        ];
        // challenge_id required for real challenges, nullable for AI
        if ($req->input('mode') === 'aigenerated') {
            $rules['challenge_id'] = ['nullable','integer'];
        } else {
            $rules['challenge_id'] = ['required','integer'];
            // If you want to enforce existence, add: Rule::exists('solo_challenges','id')
        }

        $data = $req->validate($rules);

        $userId = Auth::id();

        // Don't firstOrNew on NULL — create a new row for AI entries
        if (!empty($data['challenge_id'])) {
            $row = SoloTaken::firstOrNew([
                'user_id'      => $userId,
                'challenge_id' => $data['challenge_id'],
            ]);
        } else {
            $row = new SoloTaken();
            $row->user_id = $userId;
            $row->challenge_id = null;
        }

        foreach (['language','difficulty','mode'] as $k) {
            if (isset($data[$k])) $row->{$k} = $data[$k];
        }

        $row->status         = $data['status'];
        $row->time_spent_sec = max((int)($data['time_spent_sec'] ?? 0), (int)$row->time_spent_sec);
        $row->earned_xp      = max((int)($data['earned_xp'] ?? 0), (int)$row->earned_xp);

        if (array_key_exists('code_submitted', $data)) {
            $row->code_submitted = $data['code_submitted'];
        }

        if (!$row->exists && ($row->time_spent_sec > 0 || $row->status !== 'viewed')) {
            $row->started_at = now();
        }
        if (in_array($row->status, ['abandoned','completed'], true)) {
            $row->ended_at = now();
        }

        $row->save();
        // === SOLO ACHIEVEMENT AWARDING (on completed) ===
        if ($row->status === 'completed') {
            app(\App\Services\AchievementService::class)->checkAndAwardSolo(Auth::id(), function ($uid) {
                // Count all SOLO completions (including AI-generated, so no challenge_id filter)
                return \App\Models\SoloTaken::query()
                    ->where('user_id', $uid)
                    ->where('status', 'completed')
                    ->count();
            });
        }

        return response()->json([
            'success' => true,
            'data' => $row,
        ]);
    }

    // POST /api/solo/attempts
    public function storeAttempt(Request $req)
    {
        $rules = [
            'language'        => ['required', Rule::in(['python','java'])],
            'mode'            => ['required', Rule::in(['fixbugs','random','aigenerated'])],
            'time_spent_sec'  => ['required','integer','min:0'],
            'is_correct'      => ['required','boolean'],
            'code_submitted'  => ['required','string'],
            'judge_feedback'  => ['nullable','string'],
            'difficulty'      => ['nullable', Rule::in(['easy','medium','hard'])],
            'similarity'      => ['nullable','numeric','min:0','max:1'],
            'xp_earned'       => ['nullable','integer','min:0'],
            'reward_xp'       => ['nullable','integer','min:0'],
        ];
        if ($req->input('mode') === 'aigenerated') {
            $rules['challenge_id'] = ['nullable','integer'];
        } else {
            $rules['challenge_id'] = ['required','integer'];
            // Optional: Rule::exists('solo_challenges','id')
        }

        $data = $req->validate($rules);

        $userId = Auth::id();

        if (!empty($data['challenge_id'])) {
            $row = SoloTaken::firstOrNew([
                'user_id'      => $userId,
                'challenge_id' => $data['challenge_id'],
            ]);
        } else {
            $row = new SoloTaken();
            $row->user_id = $userId;
            $row->challenge_id = null;
        }

        $row->language   = $data['language'];
        $row->mode       = $data['mode'];
        if (isset($data['difficulty'])) $row->difficulty = $data['difficulty'];

        $row->submit_count   = (int)$row->submit_count + 1;
        $row->time_spent_sec = max((int)$row->time_spent_sec, (int)$data['time_spent_sec']);
        $row->code_submitted = $data['code_submitted'];

        if (isset($data['similarity'])) {
            $row->last_similarity = $data['similarity'];
        }

        if ($data['is_correct']) {
            $row->status = 'completed';
            $xp = $data['xp_earned'] ?? $data['reward_xp'] ?? 0;
            $row->earned_xp = max((int)$row->earned_xp, (int)$xp);
            $row->ended_at = now();
        } else {
            $row->status = 'submitted_incorrect';
        }

        if (!$row->started_at) $row->started_at = now();
        $row->save();
        
        // === SOLO ACHIEVEMENT AWARDING (on completed) ===
        if ($row->status === 'completed') {
            app(\App\Services\AchievementService::class)->checkAndAwardSolo(Auth::id(), function ($uid) {
                return \App\Models\SoloTaken::query()
                    ->where('user_id', $uid)
                    ->where('status', 'completed')
                    ->count();
            });
        }

        return response()->json([
            'success' => true,
            'data' => [
                'xp_earned'    => (int)($data['xp_earned'] ?? $row->earned_xp ?? 0),
                'status'       => $row->status,
                'submit_count' => $row->submit_count,
            ],
        ]);
    }

    // GET /api/solo/taken
    public function listTaken()
    {
        // Only real challenges, so your Solo board filtering works (no NULL ids)
        $rows = SoloTaken::query()
            ->where('user_id', Auth::id())
            ->whereNotNull('challenge_id')
            ->get(['challenge_id','status']);

        return response()->json([
            'success' => true,
            'data' => $rows,
        ]);
    }
}
