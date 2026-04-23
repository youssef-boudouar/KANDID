<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;


class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(Request $request)
    {
        // Invitation register
        if ($request->invite_token) {
            $invitation = $this->authService->findInvitation($request->invite_token);

            if (!$invitation) {
                return response()->json(['message' => 'Invalid invite link'], 400);
            }

            if ($invitation->expires_at && $invitation->expires_at->isPast()) {
                $invitation->delete();
                return response()->json(['message' => 'This invite link has expired'], 400);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:50',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|confirmed|min:8',
            ]);

            if ($invitation->email !== $validated['email']) {
                return response()->json(['message' => 'Email does not match the invitation'], 400);
            }

            $result = $this->authService->registerWithInvitation($invitation, $validated);

            return response()->json([
                'message' => 'registered successfully',
                'token' => $result['token'],
                'user' => $result['user'],
            ], 201);
        }

        // Normal Register
        $validatedUserInfos = $request->validate([
            'name' => 'required|string|max:50',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|confirmed|min:8',
        ]);

        $validatedCompanyInfos = $request->validate([
            'company_name' => 'required|string|max:50',
            'domain' => 'nullable|string|unique:companies',
        ]);

        $result = $this->authService->register($validatedUserInfos, $validatedCompanyInfos);

        return response()->json([
            'message' => 'registered successfully',
            'token' => $result['token'],
            'user' => $result['user'],
        ], 201); // Created
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $result = $this->authService->login($credentials);

        if (!$result) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401); // Unauthorized
        }

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => $result['user'],
            'token' => $result['token'],
        ]);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'You are logged out',
        ]);
    }

    public function invite(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $this->authService->invite(
            $request->user()->company_id,
            $request->user()->company->name,
            $validated['email']
        );

        return response()->json(['message' => 'Invitation sent!'], 201);
    }
}
