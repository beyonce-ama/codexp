<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Fulfill the signed email verification link then redirect.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        // If already verified, just go to dashboard
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended('/dashboard');
        }

        // Marks the email as verified and fires the Verified event
        $request->fulfill();

        return redirect()->intended('/dashboard')->with('verified', true);
    }
}
