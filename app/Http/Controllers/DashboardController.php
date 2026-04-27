<?php

namespace App\Http\Controllers;

use App\Models\JobOffer;
use App\Models\Application;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $activeJobs = JobOffer::where('company_id', $companyId)->where('status', 'active')->count();

        $totalJobs = JobOffer::where('company_id', $companyId)->count();

        $totalApplications = Application::whereHas('jobOffer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->count();

        $hiredCount = Application::whereHas('jobOffer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->where('status', 'hired')->count();

        // get how many candidates in each step
        $pipeline = Application::whereHas('jobOffer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->selectRaw('status, COUNT(*) as count')->groupBy('status')->get();

        $recentApplications = Application::whereHas('jobOffer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->with('candidate:id,first_name,last_name,email', 'jobOffer:id,title')->orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'active_jobs' => $activeJobs,
            'total_jobs' => $totalJobs,
            'total_applications' => $totalApplications,
            'hired_count' => $hiredCount,
            'pipeline' => $pipeline,
            'recent_applications' => $recentApplications,
        ]);
    }
}
