<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthService
{
    public function findInvitation( $token)
    {
        return Invitation::where('token', $token)->first();
    }

    public function registerWithInvitation(Invitation $invitation,  $validated)
    {
        $user = User::create(array_merge($validated, [
            'company_id' => $invitation->company_id,
            'role' => 'recruiter',
        ]));

        $invitation->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function register($validatedUserInfos, $validatedCompanyInfos)
    {
        // ALL OR NOTHING
        $result = DB::transaction(function () use ($validatedCompanyInfos, $validatedUserInfos) {

            $company = Company::create([
                'name' => $validatedCompanyInfos['company_name'],
                'domain' => $validatedCompanyInfos['domain'] ?? null,
            ]);

            $user = User::create(array_merge($validatedUserInfos, ['company_id' => $company->id, 'role' => 'recruiter']));

            // Mark the registering user as the company owner
            $company->update(['created_by' => $user->id]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return ['user' => $user, 'token' => $token];
        });

        return $result;
    }

    public function login(array $credentials)
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!Auth::attempt($credentials)) {
            return null;
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
     }

    public function logout($user)
    {
        $user->tokens()->delete();
    }

    public function invite(int $companyId, string $companyName, string $email)
    {
        $token = Str::random(32);

        $invitation = Invitation::create([
            'company_id' => $companyId,
            'email' => $email,
            'token' => $token,
            'expires_at' => now()->addHours(48),
        ]);

        $link = env('FRONTEND_URL', 'http://localhost:5173') . '/register?token=' . $token;

        Mail::raw("You're invited to join {$companyName} on KANDID! Click here: {$link}", function ($msg) use ($email, $companyName) {
            $msg->to($email);
            $msg->subject("Join {$companyName} on KANDID");
        });
    }
}
