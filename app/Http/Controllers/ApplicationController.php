<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\JobOffer;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{

    public function index(Request $request, $jobOfferId)  // show all applications of a job offer
    {
        $jobOffer = JobOffer::where('company_id', $request->user()->company_id)
            ->findOrFail($jobOfferId);

        $applications = Application::where('job_offer_id', $jobOffer->id)
            ->with('candidate')
            ->orderBy('kanban_order')
            ->get();

        return response()->json($applications);
    }

    public function show(Request $request, $id) // show an application's details
    {
        $application = Application::with(['candidate', 'jobOffer', 'notes.user'])
            ->whereHas('jobOffer', function ($query) use ($request) {
                $query->where('company_id', $request->user()->company_id);
            })->findOrFail($id);


        return response()->json($application);
    }


    public function destroy(Request $request, $id)
    {
        $application = Application::whereHas('jobOffer', function ($query) use ($request) {
                $query->where('company_id', $request->user()->company_id);
            })->findOrFail($id);

        $application->delete();

        return response()->json(['message' => 'Application deleted']);
    }
}
