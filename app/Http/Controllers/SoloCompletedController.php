<?php

namespace App\Http\Controllers;

use App\Models\SoloTaken;
use Illuminate\Support\Facades\Auth;

class SoloCompletedController extends Controller
{
    // GET /api/solo/completed
    public function index()
    {
        try {
            $userId = Auth::id();

            $data = SoloTaken::query()
                ->with('challenge:id,title,description,language,difficulty,mode,reward_xp') // include challenge info
                ->where('user_id', $userId)
                ->whereIn('status', ['completed', 'abandoned', 'retaken'])
                ->orderByDesc('updated_at')
                ->get([
                    'id',
                    'challenge_id',
                    'language',
                    'difficulty',
                    'mode',
                    'status',
                    'time_spent_sec',
                    'earned_xp',
                    'updated_at'
                ]);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching completed challenges',
                'error' => $e->getMessage()
            ], 500);
        }
    }
      public function retake(Request $req)
    {
        $data = $req->validate([
            'challenge_id'   => 'required|integer',
            'language'       => 'required|string|max:20',
            'difficulty'     => 'required|string|max:20',
            'mode'           => 'required|string|max:20',
            'time_spent_sec' => 'nullable|integer|min:0',
            'code_submitted' => 'required|string',
            'is_correct'     => 'required|boolean',
        ]);

        $userId = Auth::id();

        // Always make a new row for retakes
        $retake = new SoloTaken();
        $retake->user_id = $userId;
        $retake->challenge_id = $data['challenge_id'];
        $retake->language = $data['language'];
        $retake->difficulty = $data['difficulty'];
        $retake->mode = $data['mode'];
        $retake->code_submitted = $data['code_submitted'];
        $retake->time_spent_sec = $data['time_spent_sec'] ?? 0;
        $retake->started_at = now();

        // ✅ Even if correct → mark as completed but give 0 XP
        if ($data['is_correct']) {
            $retake->status = 'completed';
            $retake->earned_xp = 0; // ✅ No XP reward for retake
            $retake->ended_at = now();
        } else {
            $retake->status = 'submitted_incorrect';
            $retake->earned_xp = 0;
        }

        $retake->save();

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $retake->status,
                'earned_xp' => 0,
            ],
        ]);
    }
}
