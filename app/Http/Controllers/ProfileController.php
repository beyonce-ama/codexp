<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        return response()->json(['success' => true, 'data' => $request->user()]);
    }

    public function show(Request $request)
    {
        $profile = $request->user()->profile()->first();
        return response()->json(['success'=>true,'data'=>[
            'user' => $request->user(),
            'profile' => $profile
        ]]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'username'      => 'sometimes|string|max:50',
            'avatar_url'    => 'sometimes|nullable|string',
            'music_enabled' => 'sometimes|boolean',
            'sound_enabled' => 'sometimes|boolean',
        ]);

        $profile = UserProfile::firstOrCreate(['user_id' => $request->user()->id]);
        $profile->fill($data)->save();

        return response()->json(['success'=>true,'data'=>$profile]);
    }
}
