<?php
namespace Tests\Feature;

use App\Models\Company;
use App\Models\JobOffer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobOfferTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): array
    {
        $company = Company::create(['name' => 'Acme']);
        $user    = User::factory()->create(['company_id' => $company->id, 'role' => 'recruiter']);
        $token   = $user->createToken('test')->plainTextToken;
        return [$user, $company, $token];
    }

    public function test_user_can_create_job_offer(): void
    {
        [, , $token] = $this->makeUser();

        $this->postJson('/api/job-offers', [
            'title'       => 'Engineer',
            'description' => 'Build things',
            'status'      => 'active',
        ], ['Authorization' => "Bearer $token"])
        ->assertStatus(201)
        ->assertJsonFragment(['title' => 'Engineer']);
    }

    public function test_user_cannot_see_other_company_jobs(): void
    {
        [, , $tokenA] = $this->makeUser();
        $companyB = Company::create(['name' => 'Other Co']);
        $userB    = User::factory()->create(['company_id' => $companyB->id]);
        JobOffer::create(['title' => 'B Job', 'description' => '...', 'status' => 'active', 'company_id' => $companyB->id, 'created_by' => $userB->id]);

        $response = $this->getJson('/api/job-offers', ['Authorization' => "Bearer $tokenA"]);
        $response->assertStatus(200);
        $response->assertJsonMissing(['title' => 'B Job']);
    }

    public function test_validation_fails_without_title(): void
    {
        [, , $token] = $this->makeUser();

        $this->postJson('/api/job-offers', ['description' => 'No title'], ['Authorization' => "Bearer $token"])
            ->assertStatus(422);
    }
}
