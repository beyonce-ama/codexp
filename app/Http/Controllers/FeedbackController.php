<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $q = Feedback::query()->with('user')->latest();
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('type'))   $q->where('type', $request->type);
        return response()->json(['success'=>true,'data'=>$q->paginate(20)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'    => 'required|in:issue,feedback,feature,report',
            'title'   => 'required|string|max:200',
            'message' => 'required|string',
        ]);

        $fb = Feedback::create([
            'user_id' => $request->user()->id,
            'type'    => $data['type'],
            'title'   => $data['title'],
            'message' => $data['message'],
            'status'  => 'open',
        ]);

        return response()->json(['success'=>true,'data'=>$fb], 201);
    }

    public function update(Request $request, Feedback $feedback)
    {
        $data = $request->validate([
            'status'  => 'sometimes|in:open,in_progress,resolved,closed',
            'title'   => 'sometimes|string|max:200',
            'message' => 'sometimes|string',
            'type'    => 'sometimes|in:issue,feedback,feature,report',
        ]);

        $feedback->fill($data)->save();
        return response()->json(['success'=>true,'data'=>$feedback]);
    }

    public function destroy(Feedback $feedback)
    {
        $feedback->delete();
        return response()->json(['success'=>true]);
    }
}
