<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMultipleRoles
{
    /**
     * Allow any of the provided roles: roles:admin,participant
     */
    public function handle(Request $request, Closure $next, string $rolesCsv): Response
    {
        if (!$request->user()) {
            return $request->expectsJson()
                ? response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'error_code' => 'UNAUTHENTICATED',
                ], 401)
                : redirect()->route('login');
        }

        // Optional: account status
        if (isset($request->user()->status) && $request->user()->status !== 'active') {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been suspended.',
                    'error_code' => 'ACCOUNT_SUSPENDED',
                ], 403);
            }
            auth()->logout();
            return redirect()->route('login')->withErrors([
                'email' => 'Your account has been suspended.',
            ]);
        }

        // Sanitize roles list to CODEXP AI roles only
        $allowedInput = array_map('trim', explode(',', $rolesCsv));
        $allowed = array_values(array_intersect($allowedInput, ['admin','participant']));

        if (empty($allowed) || !in_array($request->user()->role, $allowed, true)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient permissions',
                    'error_code' => 'INSUFFICIENT_PERMISSIONS',
                    'allowed_roles' => $allowed,
                    'user_role' => $request->user()->role,
                ], 403);
            }

            return match ($request->user()->role) {
                'admin'       => redirect()->route('admin.dashboard'),
                'participant' => redirect()->route('participant.dashboard'),
                default       => redirect()->route('home'),
            };
        }

        return $next($request);
    }
}
