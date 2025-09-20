<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Character;
use Illuminate\Http\Request;

class CharacterController extends Controller
{
    public function index()
    {
        return response()->json(['success'=>true,'data'=>Character::orderBy('id','asc')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'=>'required|string|max:50',
            'asset_idle'=>'nullable|string',
            'asset_happy'=>'nullable|string',
            'asset_sad'=>'nullable|string',
            'asset_thinking'=>'nullable|string',
        ]);
        $row = Character::create($data);
        return response()->json(['success'=>true,'data'=>$row], 201);
    }

    public function update(Request $request, int $id)
    {
        $row = Character::findOrFail($id);
        $row->fill($request->only(['name','asset_idle','asset_happy','asset_sad','asset_thinking']))->save();
        return response()->json(['success'=>true,'data'=>$row]);
    }

    public function destroy(int $id)
    {
        Character::findOrFail($id)->delete();
        return response()->json(['success'=>true]);
    }
}
