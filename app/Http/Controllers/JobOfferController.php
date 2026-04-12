<?php

namespace App\Http\Controllers;

use App\Models\JobOffer;
use App\Http\Requests\StoreJobOfferRequest;
use App\Http\Requests\UpdateJobOfferRequest;
use Illuminate\Http\Request;

class JobOfferController extends Controller
{
    public function index(Request $request)
    {
        $jobOffers = JobOffer::withCount('applications')->where('company_id', $request->user()->company_id)->get();

        return response()->json($jobOffers);
    }

    public function store(StoreJobOfferRequest $request)
    {
        $validated = $request->validated();

        $jobOffer = JobOffer::create(array_merge($validated, [
            'company_id' => $request->user()->company_id,
            'created_by' =>$request->user()->id,
        ]));

        return response()->json($jobOffer, 201);
    }

    public function show(Request $request, $id)
    {
        $jobOffer = JobOffer::withCount('applications')->where('company_id', $request->user()->company_id)->findOrFail($id);

        return response()->json($jobOffer);
    }

    public function update(UpdateJobOfferRequest $request, $id)
    {
        $jobOffer = JobOffer::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        $validated = $request->validated();

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
