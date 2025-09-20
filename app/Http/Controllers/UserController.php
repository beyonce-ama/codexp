<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;


class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $q = User::query()->with('profile');

            if ($request->filled('role')) {
                $q->where('role', $request->role);
            }

            if ($request->filled('search')) {
                $s = "%{$request->search}%";
                $q->where(function ($w) use ($s) {
                    $w->where('name', 'like', $s)
                      ->orWhere('email', 'like', $s);
                });
            }

            $users = $q->latest()->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'total' => $users->total(),
                    'per_page' => $users->perPage(),
                    'last_page' => $users->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching users: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
           $data = $request->validate([
                'name'     => ['required','string','max:255', Rule::unique('users','name')], // ← added unique on name
                'email'    => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role'     => ['required', Rule::in(['admin', 'participant'])],
            ]);

            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => $data['role'],
            ]);

            // Use "name" as the base username; make it unique if taken
            $baseUsername = $this->normalizeUsername($data['name']);
            $username = $this->generateUniqueUsername($baseUsername);

            UserProfile::create([
                'user_id'  => $user->id,
                'username' => $username,
            ]);

            return response()->json(['success' => true, 'data' => $user], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating user: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $u = User::with(['profile', 'languageStats'])->findOrFail($id);
            return response()->json(['success' => true, 'data' => $u]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $u = User::findOrFail($id);
           $data = $request->validate([
                'name'           => ['sometimes','string','max:255', Rule::unique('users','name')->ignore($u->id)], // ← added unique on name (ignore self)
                'email'          => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($u->id)],
                'password'       => 'sometimes|nullable|string|min:6',
                'role'           => ['sometimes', Rule::in(['admin', 'participant'])],
                'sync_username'  => 'sometimes|boolean', // optional toggle
            ]);

            $nameWasChanged = array_key_exists('name', $data) && $data['name'] !== $u->name;

            if (array_key_exists('password', $data)) {
                if ($data['password']) {
                    $data['password'] = Hash::make($data['password']);
                } else {
                    unset($data['password']);
                }
            }

            $u->fill($data)->save();

            // If requested (default true) and name changed, update profile username too
            $shouldSync = $request->boolean('sync_username', true);
            if ($nameWasChanged && $shouldSync) {
                // ✅ Ensure we provide username when creating the profile
                $baseUsername = $this->normalizeUsername($u->name);

                $profile = UserProfile::firstOrCreate(
                    ['user_id' => $u->id],
                    ['username' => $this->generateUniqueUsername($baseUsername, $u->id)]
                );

                // If the current username already equals the normalized base, keep it;
                // otherwise, regenerate uniquely from the new name.
                if ($profile->wasRecentlyCreated === false) {
                    if ($profile->username !== $baseUsername) {
                        $profile->username = $this->generateUniqueUsername($baseUsername, $profile->user_id);
                        $profile->save();
                    }
                }
            }
                        return response()->json(['success' => true, 'data' => $u]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating user: ' . $e->getMessage()
            ], 500);
        }
    }
    private function normalizeUsername(string $str): string
    {
        $trimmed = trim($str);
        // collapse whitespace to single spaces, then replace spaces with underscores
        $collapsed = preg_replace('/\s+/', ' ', $trimmed);
        $username = str_replace(' ', '_', $collapsed);
        // optionally strip non-URL-safe chars while keeping underscores and dots
        $username = preg_replace('/[^A-Za-z0-9._\-]/', '', $username) ?: 'user';
        // limit length if you have a column limit (e.g., 50)
        return Str::limit($username, 50, '');
    }

    /**
     * Generate a unique username, appending a numeric suffix if needed.
     * If $excludeUserId is provided, that profile is ignored during uniqueness checks (useful on update).
     */
    private function generateUniqueUsername(string $base, ?int $excludeUserId = null): string
    {
        $candidate = $base;
        $i = 0;

        while ($this->usernameExists($candidate, $excludeUserId)) {
            $i++;
            $suffix = (string)$i;
            // ensure we respect max length if your column has one (e.g., 50)
            $max = 50;
            $candidate = Str::limit($base, $max - strlen($suffix), '') . $suffix;
        }

        return $candidate;
    }

    private function usernameExists(string $username, ?int $excludeUserId = null): bool
    {
        $q = UserProfile::where('username', $username);
        if ($excludeUserId) {
            $q->where('user_id', '<>', $excludeUserId);
        }
        return $q->exists();
    }

    public function destroy(int $id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting user: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getByRole(string $role)
    {
        try {
            if (!in_array($role, ['admin', 'participant'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid role'
                ], 400);
            }

            $users = User::where('role', $role)->get();
            return response()->json(['success' => true, 'data' => $users]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching users: ' . $e->getMessage()
            ], 500);
        }
    }

    public function systemStats()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'admin_users' => User::where('role', 'admin')->count(),
                'participant_users' => User::where('role', 'participant')->count(),
                'new_users_today' => User::whereDate('created_at', today())->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching stats: ' . $e->getMessage()
            ], 500);
        }
    }
}
