<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use App\Models\JobOffer;
use App\Models\Application;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_companies' => Company::count(),
            'total_users' => User::count(),
            'total_jobs' => JobOffer::count(),
            'total_applications' => Application::count(),
        ]);
    }

    public function companies()
    {
        $companies = Company::withCount('users', 'jobOffers')->get();
        return response()->json($companies);
    }

    public function users()
    {
        $users = User::with('company:id,name')->get();
        return response()->json($users);
    }

    public function deleteCompany($id)
    {
        $company = Company::findOrFail($id);
        $company->delete();
        return response()->json(['message' => 'Company deleted']);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if($user->role === 'admin')
        {
            return response()->json(['message' => 'cannot delete admin'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
