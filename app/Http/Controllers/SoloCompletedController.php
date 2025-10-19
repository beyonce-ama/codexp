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
}
