<?php
namespace Tests\Feature;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\Company;
use App\Models\JobOffer;
use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteTest extends TestCase
{
    use RefreshDatabase;

    private function setupApp(): array
    {
        $company   = Company::create(['name' => 'Acme']);
        $user      = User::factory()->create(['company_id' => $company->id]);
        $token     = $user->createToken('t')->plainTextToken;
        $job       = JobOffer::create(['title' => 'Dev', 'description' => '...', 'status' => 'active', 'company_id' => $company->id, 'created_by' => $user->id]);
        $candidate = Candidate::create(['first_name' => 'J', 'last_name' => 'D', 'email' => 'j@d.com', 'phone' => '0600']);
        $app       = Application::create(['candidate_id' => $candidate->id, 'job_offer_id' => $job->id, 'status' => 'screening', 'kanban_order' => 0]);
        return [$user, $token, $app, $company];
    }

    public function test_recruiter_can_add_note(): void
    {
        [, $token, $app] = $this->setupApp();

        $this->postJson("/api/applications/{$app->id}/notes",
            ['content' => 'Great candidate'],
            ['Authorization' => "Bearer $token"]
        )->assertStatus(201)->assertJsonFragment(['content' => 'Great candidate']);
    }

    public function test_recruiter_can_only_delete_own_notes(): void
    {
        [$user, $token, $app, $company] = $this->setupApp();

        $other = User::factory()->create(['company_id' => $company->id]);
        $note  = Note::create(['user_id' => $other->id, 'application_id' => $app->id, 'content' => 'other note']);

        $this->deleteJson("/api/notes/{$note->id}", [], ['Authorization' => "Bearer $token"])
            ->assertStatus(403);
    }
}
