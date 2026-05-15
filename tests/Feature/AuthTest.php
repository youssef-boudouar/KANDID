<?php
namespace Tests\Feature;

use App\Models\Company;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_company(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'company_name'          => 'Test Co',
        ]);

        $response->assertStatus(201)->assertJsonStructure(['token', 'user']);
    }

    public function test_user_can_login(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        User::factory()->create([
            'email'      => 'test@example.com',
            'company_id' => $company->id,
            'role'       => 'recruiter',
        ]);

        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'password'])
            ->assertStatus(200)
            ->assertJsonStructure(['token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        User::factory()->create(['email' => 'test@example.com', 'company_id' => $company->id]);

        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'wrong'])
            ->assertStatus(401);
    }

    public function test_expired_invite_is_rejected(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        Invitation::create([
            'company_id' => $company->id,
            'email'      => 'invite@example.com',
            'token'      => 'expiredtoken',
            'expires_at' => now()->subHour(),
        ]);

        $this->postJson('/api/register', [
            'invite_token'          => 'expiredtoken',
            'name'                  => 'New User',
            'email'                 => 'invite@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(400)->assertJson(['message' => 'This invite link has expired']);
    }
}
