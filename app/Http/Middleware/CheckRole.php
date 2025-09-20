<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Enforce a single required role (admin or participant) for CODEXP AI.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Must be logged in
        if (!$request->user()) {
            return $request->expectsJson()
                ? response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'error_code' => 'UNAUTHENTICATED',
                ], 401)
                : redirect()->route('login');
        }

        // Optional: account status gate (only if you actually store status)
        if (isset($request->user()->status) && $request->user()->status !== 'active') {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been suspended. Please contact administrator.',
                    'error_code' => 'ACCOUNT_SUSPENDED',
                ], 403);
            }
            auth()->logout();
            return redirect()->route('login')->withErrors([
                'email' => 'Your account has been suspended. Please contact administrator.',
            ]);
        }

        // Validate required role (CODEXP AI only uses admin|participant)
        $validRoles = ['admin', 'participant'];
        if (!in_array($role, $validRoles, true)) {
            return $request->expectsJson()
                ? response()->json([
                    'success' => false,
                    'message' => 'Invalid role specified',
                    'error_code' => 'INVALID_ROLE',
                ], 400)
                : abort(400, 'Invalid role specified');
        }

        // Enforce role
        if ($request->user()->role !== $role) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient permissions. Required role: ' . $role,
                    'error_code' => 'INSUFFICIENT_PERMISSIONS',
                    'required_role' => $role,
                    'user_role' => $request->user()->role,
                ], 403);
            }

            // Redirect based on user's current role
            return match ($request->user()->role) {
                'admin'       => redirect()->route('admin.dashboard')
                                  ->with('error', 'You do not have permission to access that page.'),
                'participant' => redirect()->route('participant.dashboard')
                                  ->with('error', 'You do not have permission to access that page.'),
                default       => redirect()->route('home')
                                  ->with('error', 'Invalid user role. Please contact administrator.'),
            };
        }

        return $next($request);
    }
}
