<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\JobOffer;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{

    public function index(Request $request, $jobOfferId)
    {
        $jobOffer = JobOffer::where('company_id', $request->user()->company_id)->findOrFail($jobOfferId);

        $applications = Application::where('job_offer_id', $jobOffer->id)->with('candidate')->orderBy('kanban_order')->get();

        return response()->json($applications);
    }

    public function show(Request $request, $id)
    {
        $application = Application::findOrFail($id);

        $jobOffer = JobOffer::findOrFail($application->job_offer_id);

        if ($jobOffer->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $application->load(['candidate', 'jobOffer', 'notes.user']);

        return response()->json($application);
    }

    public function move(Request $request, $id)
    {
        $application = Application::findOrFail($id);

        $jobOffer = JobOffer::findOrFail($application->job_offer_id);

        if ($jobOffer->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:screening,interview,technical,hired,rejected',
            'kanban_order' => 'required|integer',
        ]);

        $application->update($validated);

        return response()->json($application);
    }

    public function destroy(Request $request, $id)
    {
        $application = Application::findOrFail($id);

        $jobOffer = JobOffer::findOrFail($application->job_offer_id);

        if ($jobOffer->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $application->delete();

        return response()->json(['message' => 'Application deleted']);
    }
}
