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

        // Count active jobs
        $activeJobs = JobOffer::where('company_id', $companyId)
            ->where('status', 'active')
            ->count();

        // Count total jobs
        $totalJobs = JobOffer::where('company_id', $companyId)->count();

        // Count total applications across all company jobs
        $totalApplications = Application::whereHas('jobOffer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->count();

        // Count hired
        $hiredCount = Application::whereHas('jobOffer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->where('status', 'hired')->count();

        // Count per status (for pipeline overview)
        $pipeline = Application::whereHas('jobOffer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->selectRaw('status, COUNT(*) as count')
          ->groupBy('status')
          ->get();

        // Recent 5 applications
        $recentApplications = Application::whereHas('jobOffer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->with('candidate:id,first_name,last_name,email', 'jobOffer:id,title')
          ->orderBy('created_at', 'desc')
          ->take(5)
          ->get();

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
