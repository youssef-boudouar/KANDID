<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\JobOffer;
use App\Http\Requests\ApplyToJobRequest;
use Illuminate\Http\Request;

class PublicJobController extends Controller
{
    public function index()
    {
        $jobs = JobOffer::where('status', 'active')->with('company:id,name')->orderBy('created_at', 'desc')->get();

        return response()->json($jobs);
    }
    public function show($id)
    {
        $job = JobOffer::where('status', 'active')->with('company:id,name')->findOrFail($id);

        return response()->json($job);
    }

    public function apply(ApplyToJobRequest $request, $id)
    {
        $job = JobOffer::where('status', 'active')->findOrFail($id);

        $validated = $request->validated();

        $candidate = Candidate::where('email', $validated['email'])->first();

        if ($candidate) {
            $alreadyApplied = Application::where('candidate_id', $candidate->id)->where('job_offer_id', $job->id)->exists();

            if ($alreadyApplied) {
                return response()->json(['message' => 'You have already applied to this job offer'], 409); 
            }
        }

        $resumePath = $request->file('resume')->store('resumes', 'public');

        if (!$candidate) {
            $candidate = Candidate::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'resume_path' => $resumePath,
            ]);
        }
        else {
            $candidate->resume_path = $resumePath;
            $candidate->save();
        }

        Application::create([
            'candidate_id' => $candidate->id,
            'job_offer_id' => $job->id,
            'status' => 'screening',
            'kanban_order' => 0,
        ]);

        return response()->json([
            'message' => 'Application submitted successfully!'
        ], 201);
    }
}
