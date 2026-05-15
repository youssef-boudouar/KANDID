<?php
namespace Tests\Feature;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\Company;
use App\Models\JobOffer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    private function makeJob(string $status = 'active'): array
    {
        $company = Company::create(['name' => 'Acme']);
        $user    = User::factory()->create(['company_id' => $company->id]);
        $job     = JobOffer::create([
            'title' => 'Dev', 'description' => '...', 'status' => $status,
            'company_id' => $company->id, 'created_by' => $user->id,
        ]);
        return [$user, $company, $job];
    }

    public function test_candidate_can_apply_to_active_job(): void
    {
        Storage::fake('public');
        [, , $job] = $this->makeJob('active');

        $this->postJson("/api/public/jobs/{$job->id}/apply", [
            'first_name' => 'Jane',
            'last_name'  => 'Doe',
            'email'      => 'jane@example.com',
            'phone'      => '0612345678',
            'resume'     => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
        ])->assertStatus(201);

        $this->assertDatabaseHas('applications', ['job_offer_id' => $job->id]);
    }

    public function test_cannot_apply_to_draft_job(): void
    {
        Storage::fake('public');
        [, , $job] = $this->makeJob('draft');

        $this->postJson("/api/public/jobs/{$job->id}/apply", [
            'first_name' => 'Jane', 'last_name' => 'Doe',
            'email' => 'jane@example.com', 'phone' => '0612345678',
            'resume' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
        ])->assertStatus(404);
    }

    public function test_recruiter_cannot_move_other_company_application(): void
    {
        $companyA = Company::create(['name' => 'A']);
        $companyB = Company::create(['name' => 'B']);
        $userA    = User::factory()->create(['company_id' => $companyA->id]);
        $userB    = User::factory()->create(['company_id' => $companyB->id]);
        $tokenA   = $userA->createToken('t')->plainTextToken;
        $jobB     = JobOffer::create(['title' => 'BJob', 'description' => '...', 'status' => 'active', 'company_id' => $companyB->id, 'created_by' => $userB->id]);
        $candidate = Candidate::create(['first_name' => 'X', 'last_name' => 'Y', 'email' => 'x@x.com', 'phone' => '0600000000']);
        $app = Application::create(['candidate_id' => $candidate->id, 'job_offer_id' => $jobB->id, 'status' => 'screening', 'kanban_order' => 0]);

        $this->putJson("/api/applications/{$app->id}/move",
            ['status' => 'hired', 'kanban_order' => 0],
            ['Authorization' => "Bearer $tokenA"]
        )->assertStatus(403);
    }
}
