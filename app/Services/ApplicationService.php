<?php

namespace App\Services;

use App\Models\Application;
use App\Models\JobOffer;

class ApplicationService
{
    private function checkAuthorization($id, $companyId)
    {
        $application = Application::findOrFail($id);

        $jobOffer = JobOffer::findOrFail($application->job_offer_id);

        if ($jobOffer->company_id !== $companyId) {
            return null;
        }

        return $application;
    }

    public function getApplicationsForJob($jobOfferId, $companyId)
    {
        $jobOffer = JobOffer::where('company_id', $companyId)->findOrFail($jobOfferId);

        return Application::where('job_offer_id', $jobOffer->id)->with('candidate')->orderBy('kanban_order')->get();
    }

    public function getApplication($id, $companyId)
    {
        $application = $this->checkAuthorization($id, $companyId);

        if (!$application) {
            return null;
        }

        $application->load(['candidate', 'jobOffer', 'notes.user']);

        return $application;
    }

    public function moveApplication($id, int $companyId, array $validated)
    {
        $application = $this->checkAuthorization($id, $companyId);

        if (!$application) {
            return null;
        }

        $application->update($validated);

        return $application;
    }

    public function deleteApplication($id, int $companyId): bool
    {
        $application = $this->checkAuthorization($id, $companyId);

        if (!$application) {
            return false;
        }

        $application->delete();

        return true;
    }
}
