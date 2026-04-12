<?php

namespace App\Http\Controllers;

use App\Services\ApplicationService;
use App\Http\Requests\MoveApplicationRequest;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(private ApplicationService $applicationService) {}

    public function index(Request $request, $jobOfferId)
    {
        $applications = $this->applicationService->getApplicationsForJob($jobOfferId, $request->user()->company_id);

        return response()->json($applications);
    }

    public function show(Request $request, $id)
    {
        $application = $this->applicationService->getApplication($id, $request->user()->company_id);

        if (!$application) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($application);
    }

    public function move(MoveApplicationRequest $request, $id)
    {
        $validated = $request->validated();

        $application = $this->applicationService->moveApplication($id, $request->user()->company_id, $validated);

        if (!$application) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($application);
    }

    public function destroy(Request $request, $id)
    {
        $deleted = $this->applicationService->deleteApplication($id, $request->user()->company_id);

        if (!$deleted) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['message' => 'Application deleted']);
    }
}
