<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProfileController extends Controller
{
    /**
     * Keep filenames only here. Files must exist under public/avatars/.
     */
    private function allowedAvatarList(): array
    {
        return [
            'default.png',
            'girl1.png','boy1.png','boy3.png',
            'girl2.png','boy2.png',
            'girl3.png','boy4.png',
            'girl4.png','boy5.png',
            'girl5.png','boy6.png',
        ];
    }

    /** Normalize any of: "avatars/x.png", "/avatars/x.png", or "x.png" → "avatars/x.png" (if allowed) */
    private function normalizeAvatarInput(?string $value): ?string
    {
        if (!$value) return null;
        $basename = basename(trim($value));
        if (!in_array($basename, $this->allowedAvatarList(), true)) {
            return null;
        }
        return 'avatars/'.$basename;
    }

    /** Standard user payload for the profile screens */
    private function transformUser(User $u): array
    {
        return [
            'id'          => $u->id,
            // keep "username" key for FE backward-compat; value is actually users.name
            'username'    => $u->name,
            'name'        => $u->name,
            'email'       => $u->email,
            'avatar'      => $u->avatar,                    // relative path, e.g. "avatars/boy1.png"
            'avatar_url'  => $u->avatar_url,                // accessor -> "/avatars/boy1.png"
            'stars'       => $u->stars,
            'total_xp'    => $u->total_xp,
            'created_at'  => $u->created_at,
            'updated_at'  => $u->updated_at,
        ];
    }

    /** Simple "me" endpoint (flat) */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data'    => $this->transformUser($request->user()),
        ]);
    }

    /**
     * Profile show endpoint.
     * Returns { success, data: { user: {...}, profile: {...} } } so your FE code works either way.
     */
    public function show(Request $request)
    {
        $userPayload = $this->transformUser($request->user());

        return response()->json([
            'success' => true,
            'data'    => [
                'user'    => $userPayload,
                'profile' => $userPayload, // same payload for backward-compat
            ],
        ]);
    }

    /**
     * Update profile in USERS table only.
     * Accepts:
     * - name (preferred) or username (alias)
     * - avatar (filename or path)
     * - avatar_url ("/avatars/xxx.png")
     */
    public function update(Request $request)
    {
        $request->validate([
            'name'        => ['sometimes','string','max:50'],
            'username'    => ['sometimes','string','max:50'],    // alias to name
            'avatar'      => ['sometimes','string','nullable'],
            'avatar_url'  => ['sometimes','string','nullable'],
        ]);

        /** @var User $user */
        $user = $request->user();

        // name / username
        $name = $request->string('name')->toString() ?: $request->string('username')->toString();
        if ($name !== '') {
            $user->name = $name;
        }

        // avatar via filename/path
        if ($request->filled('avatar')) {
            $normalized = $this->normalizeAvatarInput($request->string('avatar')->toString());
            if (!$normalized) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid avatar selection.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $user->avatar = $normalized;
        }
        // or avatar via avatar_url
        elseif ($request->filled('avatar_url')) {
            $val = $request->string('avatar_url')->toString();
            $val = ltrim($val, '/'); // "/avatars/x.png" -> "avatars/x.png"
            $normalized = $this->normalizeAvatarInput($val);
            if (!$normalized) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid avatar selection.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $user->avatar = $normalized;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'data'    => [
                'profile' => $this->transformUser($user),
            ],
        ]);
    }

    /** Dedicated avatar update (JSON) */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required','string'],
        ]);

        $normalized = $this->normalizeAvatarInput($request->string('avatar')->toString());
        if (!$normalized) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid avatar selection.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        /** @var User $user */
        $user = $request->user();
        $user->avatar = $normalized;
        $user->save();

        return response()->json([
            'success' => true,
            'data'    => [
                'profile' => $this->transformUser($user),
            ],
            'message' => 'Avatar updated!',
        ]);
    }
}
