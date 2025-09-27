<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PreferencesController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'sound_enabled' => ['nullable','boolean'],
            'music_enabled' => ['nullable','boolean'],
        ]);

        // Only change provided fields
        if (array_key_exists('sound_enabled', $data)) {
            $user->sound_enabled = (bool)$data['sound_enabled'];
        }
        if (array_key_exists('music_enabled', $data)) {
            $user->music_enabled = (bool)$data['music_enabled'];
        }

        $user->save();

        // Return the minimal state we need on the client
        return response()->json([
            'sound_enabled' => (bool)$user->sound_enabled,
            'music_enabled' => (bool)$user->music_enabled,
        ]);
    }
}
