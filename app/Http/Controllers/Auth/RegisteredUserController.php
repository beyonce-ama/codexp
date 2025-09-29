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
       $request->validate([
    'name' => ['required', 'string', 'max:255', 'unique:users,name'],
    'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
    'password' => ['required', 'confirmed', Rules\Password::defaults()],
], [
    'name.unique' => 'This username is already taken.',
]);


        // Create user with forced role + defaults that exist in your DB
        $user = User::create([
            'name'         => $validated['name'],
            'email'        => $validated['email'],
            'password'     => Hash::make($validated['password']),
            'role'         => 'participant',
            'status'       => 'active',     // requires 'status' to be fillable OR set below via ->forceFill()
            'stars'        => 0,
            'total_xp'     => 0,
            'sound_enabled'=> 1,
            'music_enabled'=> 1,
        ]);

        // If 'status', 'sound_enabled', 'music_enabled' aren't in $fillable, uncomment:
        // $user->forceFill([
        //     'status'        => 'active',
        //     'stars'         => 0,
        //     'total_xp'      => 0,
        //     'sound_enabled' => 1,
        //     'music_enabled' => 1,
        // ])->save();

        // This triggers Laravel's SendEmailVerificationNotification listener
        event(new Registered($user));

        // Log them in and send to the verify notice page
        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}
