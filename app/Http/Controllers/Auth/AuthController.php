<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Invitation register
        if ($request->invite_token) {
            $invitation = Invitation::where('token', $request->invite_token)->first();

            if (!$invitation) {
                return response()->json(['message' => 'Invalid invite link'], 400);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:50',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|confirmed|min:8',
            ]);

            if ($invitation->email !== $validated['email']) {
                return response()->json(['message' => 'Email does not match the invitation'], 400);
            }

            $user = User::create(array_merge($validated, [
                'company_id' => $invitation->company_id,
                'role' => 'recruiter',
            ]));

            $invitation->delete();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'registered successfully',
                'token' => $token,
                'user' => $user,
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

        // ALL OR NOTHING
        $result = DB::transaction(function () use ($validatedCompanyInfos, $validatedUserInfos) {

            $company = Company::create([
                'name' => $validatedCompanyInfos['company_name'],
                'domain' => $validatedCompanyInfos['domain'],
            ]);

            $user = User::create(array_merge($validatedUserInfos, ['company_id' => $company->id, 'role' => 'recruiter']));

            $token = $user->createToken('auth_token')->plainTextToken;

            return ['user' => $user, 'token' => $token];
        });

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

        $user = User::where('email', $request->email)->first();

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401); // Unauthorized
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'You are logged out',
        ]);
    }
    public function invite(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $token = Str::random(32);

        $invitation = Invitation::create([
            'company_id' => $request->user()->company_id,
            'email' => $validated['email'],
            'token' => $token,
        ]);

        $companyName = $request->user()->company->name;
        $link = 'http://localhost:5173/register?token=' . $token;

        Mail::raw("You're invited to join {$companyName} on KANDID! Click here: {$link}", function ($msg) use ($validated, $companyName) {
            $msg->to($validated['email']);
            $msg->subject("Join {$companyName} on KANDID");
        });

        return response()->json(['message' => 'Invitation sent!'], 201);
    }
}
