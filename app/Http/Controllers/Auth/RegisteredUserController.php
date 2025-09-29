<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        // Make sure this matches your TSX path, e.g. resources/js/Pages/auth/register.tsx
        return Inertia::render('auth/register');
    }

    /**
     * Handle registration (participant only) and send verification email.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255', 'unique:users,name'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:' . User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'name.unique' => 'This username is already taken.',
        ]);

        // Create user with forced role + defaults that exist in your DB
        $user = User::create([
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'password'      => Hash::make($validated['password']),
            'role'          => 'participant',
            'status'        => 'active',
            'stars'         => 0,
            'total_xp'      => 0,
            'sound_enabled' => 1,
            'music_enabled' => 1,
        ]);

        // If some of the above columns aren't fillable, use forceFill instead:
        // $user->forceFill([
        //     'status'        => 'active',
        //     'stars'         => 0,
        //     'total_xp'      => 0,
        //     'sound_enabled' => 1,
        //     'music_enabled' => 1,
        // ])->save();

        event(new Registered($user));       // sends verification email
        Auth::login($user);                 // log them in
        return redirect()->route('verification.notice'); // show verify notice
    }
}
