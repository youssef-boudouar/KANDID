<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use App\Models\JobOffer;
use App\Models\Application;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // GET /api/admin/stats
    public function stats()
    {
        return response()->json([
            'total_companies' => Company::count(),
            'total_users' => User::count(),
            'total_jobs' => JobOffer::count(),
            'total_applications' => Application::count(),
        ]);
    }

    // GET /api/admin/companies
    public function companies()
    {
        $companies = Company::withCount('users', 'jobOffers')->get();
        return response()->json($companies);
    }

    // GET /api/admin/users
    public function users()
    {
        $users = User::with('company:id,name')->get();
        return response()->json($users);
    }

    // DELETE /api/admin/companies/{id}
    public function deleteCompany($id)
    {
        $company = Company::findOrFail($id);
        $company->delete();
        return response()->json(['message' => 'Company deleted']);
    }

    // DELETE /api/admin/users/{id}
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
