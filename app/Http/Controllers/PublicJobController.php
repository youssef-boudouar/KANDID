<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Application;
use App\Models\Candidate;
use App\Models\JobOffer;
use App\Http\Requests\ApplyToJobRequest;
use App\Mail\NewApplicationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class PublicJobController extends Controller
{
    public function index(Request $request)
    {
        $jobs = JobOffer::where('status', 'active')
            ->with(['company:id,name,logo', 'tags:id,name,color'])
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($jobs);
    }
    public function show($id)
    {
        $job = JobOffer::where('status', 'active')->with(['company:id,name,logo', 'tags:id,name,color'])->findOrFail($id);

        return response()->json($job);
    }

    public function apply(ApplyToJobRequest $request, $id)
    {
        $job = JobOffer::where('status', 'active')->with('creator')->findOrFail($id);

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
                'first_name'  => $validated['first_name'],
                'last_name'   => $validated['last_name'],
                'email'       => $validated['email'],
                'phone'       => $validated['phone'],
                'sex'         => $validated['sex'] ?? null,
                'resume_path' => $resumePath,
            ]);
        } else {
            $candidate->resume_path = $resumePath;
            if (!empty($validated['sex'])) {
                $candidate->sex = $validated['sex'];
            }
            $candidate->save();
        }

        $application = Application::create([
            'candidate_id' => $candidate->id,
            'job_offer_id' => $job->id,
            'status' => 'screening',
            'kanban_order' => 0,
        ]);

        Activity::log(
            $job->company_id,
            null,
            'application_created',
            'application',
            $application->id,
            "{$candidate->first_name} {$candidate->last_name} applied to {$job->title}"
        );

        if ($job->creator && $job->creator->email) {
            Mail::to($job->creator->email)
                ->queue(new NewApplicationNotification($candidate, $job, $application));
        }

        return response()->json([
            'message' => 'Application submitted successfully!'
        ], 201);
    }
}
