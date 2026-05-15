<?php
namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'company_id' => null]);
        $token = $admin->createToken('t')->plainTextToken;

        $this->getJson('/api/admin/stats', ['Authorization' => "Bearer $token"])
            ->assertStatus(200)
            ->assertJsonStructure(['total_companies', 'total_users', 'total_jobs', 'total_applications']);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $company = Company::create(['name' => 'Acme']);
        $user    = User::factory()->create(['company_id' => $company->id, 'role' => 'recruiter']);
        $token   = $user->createToken('t')->plainTextToken;

        $this->getJson('/api/admin/stats', ['Authorization' => "Bearer $token"])
            ->assertStatus(403);
    }
}
