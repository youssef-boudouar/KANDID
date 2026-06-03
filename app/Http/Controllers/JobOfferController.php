<?php

namespace App\Http\Controllers;

use App\Models\JobOffer;
use App\Http\Requests\StoreJobOfferRequest;
use App\Http\Requests\UpdateJobOfferRequest;
use App\Http\Resources\JobOfferResource;
use Illuminate\Http\Request;

class JobOfferController extends Controller
{
    public function index(Request $request)
    {
        $jobOffers = JobOffer::forCompany($request->user()->company_id)
            ->withCount('applications')
            ->withCount(['applications as screening_count' => fn($q) => $q->where('status', 'screening')])
            ->withCount(['applications as interview_count' => fn($q) => $q->where('status', 'interview')])
            ->withCount(['applications as technical_count' => fn($q) => $q->where('status', 'technical')])
            ->withCount(['applications as hired_count'     => fn($q) => $q->where('status', 'hired')])
            ->withCount(['applications as rejected_count'  => fn($q) => $q->where('status', 'rejected')])
            ->with('tags')
            ->get();

        return JobOfferResource::collection($jobOffers);
    }

    public function store(StoreJobOfferRequest $request)
    {
        $validated = $request->validated();

        $jobOffer = JobOffer::create(array_merge($validated, [
            'company_id' => $request->user()->company_id,
            'created_by' =>$request->user()->id,
        ]));

        return (new JobOfferResource($jobOffer))->response()->setStatusCode(201);
    }

    public function show(Request $request, $id)
    {
        $jobOffer = JobOffer::forCompany($request->user()->company_id)
            ->withCount('applications')
            ->withCount(['applications as screening_count' => fn($q) => $q->where('status', 'screening')])
            ->withCount(['applications as interview_count' => fn($q) => $q->where('status', 'interview')])
            ->withCount(['applications as technical_count' => fn($q) => $q->where('status', 'technical')])
            ->withCount(['applications as hired_count'     => fn($q) => $q->where('status', 'hired')])
            ->withCount(['applications as rejected_count'  => fn($q) => $q->where('status', 'rejected')])
            ->with('tags')
            ->findOrFail($id);

        return new JobOfferResource($jobOffer);
    }

    public function update(UpdateJobOfferRequest $request, $id)
    {
        $jobOffer = JobOffer::forCompany($request->user()->company_id)->findOrFail($id);

        $validated = $request->validated();

        $jobOffer->update($validated);

        return new JobOfferResource($jobOffer);
    }

    public function destroy(Request $request, $id)
    {
        $jobOffer = JobOffer::forCompany($request->user()->company_id)->findOrFail($id);

        $jobOffer->delete();

        return response()->json(['message' => 'Job offer deleted']);
    }
}
