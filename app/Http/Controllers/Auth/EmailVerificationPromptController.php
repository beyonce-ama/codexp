<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page (Inertia React).
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            // Go to the main app dashboard after verification
            return redirect()->intended('/dashboard');
        }

        // IMPORTANT: path & casing must match your React file:
        // resources/js/Pages/Auth/VerifyEmail.tsx
       return Inertia::render('auth/verify-email', [
    'status' => $request->session()->get('status'),
]);
    }
}
