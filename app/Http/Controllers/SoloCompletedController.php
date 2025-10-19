<?php

namespace App\Http\Controllers;

use App\Models\SoloTaken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SoloCompletedController extends Controller
{
    // ✅ GET /api/solo/completed
    public function index()
    {
        try {
            $userId = Auth::id();

            $data = SoloTaken::query()
                ->with('challenge:id,title,description,language,difficulty,mode,reward_xp')
                ->where('user_id', $userId)
                ->whereIn('status', ['completed', 'abandoned'])
                ->orderByDesc('updated_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching completed challenges',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ✅ POST /api/solo/retake
    public function retake(Request $request)
    {
        try {
            $validated = $request->validate([
                'challenge_id'   => 'required|integer',
                'language'       => 'required|string|max:20',
                'difficulty'     => 'required|string|max:20',
                'mode'           => 'required|string|max:20',
                'is_correct'     => 'required|boolean',
                'code_submitted' => 'required|string',
                'time_spent_sec' => 'nullable|integer|min:0',
            ]);

            $userId = Auth::id();

            $retake = new SoloTaken();
            $retake->user_id = $userId;
            $retake->challenge_id = $validated['challenge_id'];
            $retake->language = $validated['language'];
            $retake->difficulty = $validated['difficulty'];
            $retake->mode = $validated['mode'];
            $retake->code_submitted = $validated['code_submitted'];
            $retake->time_spent_sec = $validated['time_spent_sec'] ?? 0;
            $retake->started_at = now();

            if ($validated['is_correct']) {
                $retake->status = 'completed';
                $retake->earned_xp = 0; // ✅ No XP for retakes
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error saving retake attempt',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
