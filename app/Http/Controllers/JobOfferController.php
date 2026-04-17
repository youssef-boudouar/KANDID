<?php

namespace App\Http\Controllers;

use App\Models\JobOffer;
use Illuminate\Http\Request;

class JobOfferController extends Controller
{
    public function index(Request $request)
    {
        $jobOffers = JobOffer::withCount('applications')->where('company_id', $request->user()->company_id)->get();

        return response()->json($jobOffers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:50',
            'description' => 'required|string',
            'status' => 'nullable|string|in:draft,active,archived',
        ]);

        $jobOffer = JobOffer::create(array_merge($validated, [
            'company_id' => $request->user()->company_id,
            'created_by' =>$request->user()->id,
        ]));

        return response()->json($jobOffer, 201);
    }

    public function show(Request $request, $id)
    {
        $jobOffer = JobOffer::withCount('applications')->where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        return response()->json($jobOffer);
    }

    public function update(Request $request, $id)
    {
        $jobOffer = JobOffer::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:50',
            'description' => 'required|string',
            'status' => 'required|string|in:draft,active,archived',
        ]);

        $jobOffer->update($validated);

        return response()->json($jobOffer);
    }

    public function destroy(Request $request, $id)
    {
        $jobOffer = JobOffer::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        $jobOffer->delete();

        return response()->json(['message' => 'Job offer deleted']);
    }
}
