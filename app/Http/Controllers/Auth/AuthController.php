<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validate User Infos
        $validatedUserInfos = $request->validate([
            'name' => 'required|string|max:50',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|confirmed|min:8',
        ]);
        // Validate Company Infos
        $validatedCompanyInfos = $request->validate([
            'name' => 'required|string|max:50',
            'domain' => 'nullable|string|unique:companies',
        ]);
        // ALL OR NOTHING (Either creating company + user (recruiter) Or Fail)
        $result = DB::transaction(function() use ($validatedCompanyInfos, $validatedUserInfos) {
            // create company
            $company = Company::create($validatedCompanyInfos);
            // create user (merging already validated data + FK and role in one array)
            $user = User::create(array_merge($validatedUserInfos, ['company_id' => $company->id, 'role' => 'recruiter']));

            // create token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Returning because we can't acced an anonymous function (Closure) from outside it
            return ['user' => $user, 'token' => $token];
        });

        // convert and send the final JSON data to frontend
        return response()->json([
            'message' => 'registered successfully',
            'token' => $result['token'],
            'user' => $result['user'],
        ], 201); // 201 = "Created" Standard API status for making a new record (by default set to 200 which means just success but 201 means success + creating something)
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
            ], 401);
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
}
