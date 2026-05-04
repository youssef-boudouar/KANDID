<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Services\ApplicationService;
use App\Http\Requests\MoveApplicationRequest;
use App\Http\Resources\ApplicationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApplicationController extends Controller
{
    public function __construct(private ApplicationService $applicationService) {}

    public function index(Request $request, $jobOfferId)
    {
        $applications = $this->applicationService->getApplicationsForJob($jobOfferId, $request->user()->company_id);

        return ApplicationResource::collection($applications);
    }

    public function show(Request $request, $id)
    {
        $application = $this->applicationService->getApplication($id, $request->user()->company_id);

        if (!$application) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return new ApplicationResource($application);
    }

    public function move(MoveApplicationRequest $request, $id)
    {
        $validated = $request->validated();

        $application = $this->applicationService->moveApplication($id, $request->user()->company_id, $validated);

        if (!$application) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        Activity::log(
            $request->user()->company_id,
            $request->user()->id,
            'status_changed',
            'application',
            $application->id,
            $request->user()->name . ' moved candidate to ' . $request->validated()['status']
        );

        return new ApplicationResource($application);
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'applications'                => 'required|array|max:100',
            'applications.*.id'           => 'required|integer',
            'applications.*.status'       => 'required|string|in:screening,interview,technical,hired,rejected',
            'applications.*.kanban_order' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            foreach ($validated['applications'] as $item) {
                $application = $this->applicationService->moveApplication(
                    $item['id'],
                    $request->user()->company_id,
                    ['status' => $item['status'], 'kanban_order' => $item['kanban_order']]
                );
                if (!$application) {
                    abort(403, 'Forbidden');
                }
            }
        });

        return response()->json(['message' => 'Reordered']);
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
