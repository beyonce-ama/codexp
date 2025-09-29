<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
        public function create()
        {
             return Inertia::render('auth/login', [
        'canResetPassword' => \Illuminate\Support\Facades\Route::has('password.request'),
        'status' => session('status'),
    ]);
        }

    /**
     * Handle login request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        Log::info('Login attempt', [
            'email' => $request->email,
            'ip' => $request->ip()
        ]);

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                Log::warning('User not found');
                return back()->withErrors(['email' => 'These credentials do not match our records.']);
            }

            if ($user->status !== 'active') {
                Log::warning('User account inactive');
                return back()->withErrors(['email' => 'Your account is not active.']);
            }

            if (!Hash::check($request->password, $user->password)) {
                Log::warning('Password mismatch');
                return back()->withErrors(['password' => 'Incorrect password.']);
            }

            $request->authenticate();
            $request->session()->regenerate();

            return redirect()->intended('/dashboard');

            Log::info('Redirecting after login', [
                'user_id' => $user->id,
                'role' => $user->role,
                'redirect' => $redirectUrl
            ]);

            return redirect()->intended($redirectUrl);

        } catch (\Exception $e) {
            Log::error('Login exception', ['message' => $e->getMessage()]);
            return back()->withErrors(['email' => 'Login error. Try again.']);
        }
    }

    /**
     * Logout user.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        Log::info('Logout', ['user_id' => $user?->id]);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
