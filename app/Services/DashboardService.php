<?php

namespace App\Services;

use App\Models\Application;
use App\Models\JobOffer;
use Carbon\Carbon;

class DashboardService
{
    public function getStats(int $companyId): array
    {
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

        // Applications this week vs last week
        $thisWeek = Application::whereHas('jobOffer', fn($q) => $q->where('company_id', $companyId))
            ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->count();

        $lastWeek = Application::whereHas('jobOffer', fn($q) => $q->where('company_id', $companyId))
            ->whereBetween('created_at', [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()])
            ->count();

        $weeklyDelta = $lastWeek > 0
            ? round((($thisWeek - $lastWeek) / $lastWeek) * 100)
            : ($thisWeek > 0 ? 100 : 0);

        // Conversion rate
        $conversionRate = $totalApplications > 0
            ? round(($hiredCount / $totalApplications) * 100, 1)
            : 0;

        // Last 14 days trend
        $trend = collect(range(13, 0))->map(function ($daysAgo) use ($companyId) {
            $date = Carbon::now()->subDays($daysAgo)->toDateString();
            $count = Application::whereHas('jobOffer', fn($q) => $q->where('company_id', $companyId))
                ->whereDate('created_at', $date)
                ->count();
            return ['date' => $date, 'count' => $count];
        })->values();

        return [
            'active_jobs' => $activeJobs,
            'total_jobs' => $totalJobs,
            'total_applications' => $totalApplications,
            'hired_count' => $hiredCount,
            'pipeline' => $pipeline,
            'recent_applications' => $recentApplications,
            'this_week'       => $thisWeek,
            'weekly_delta'    => $weeklyDelta,
            'conversion_rate' => $conversionRate,
            'trend'           => $trend,
        ];
    }
}
