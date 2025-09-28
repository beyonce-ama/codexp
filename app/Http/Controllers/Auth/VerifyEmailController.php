<?php


// VerifyEmailController.php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified for JTIMIS.
     */
public function __invoke(\Illuminate\Foundation\Auth\EmailVerificationRequest $request)
{
    if ($request->user()->hasVerifiedEmail()) {
        return redirect()->route('login')->with('status', 'email-already-verified');
    }

    $request->fulfill();

    return redirect()->route('login')->with('status', 'email-verified');
}

}