<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_log_into_admin_api(): void
    {
        User::create([
            'name' => 'Editor',
            'email' => 'editor@example.com',
            'password' => Hash::make('secret123'),
            'is_admin' => false,
        ]);

        $this->postJson('/api/admin/login', [
            'email' => 'editor@example.com',
            'password' => 'secret123',
        ])->assertStatus(422);

        $this->assertGuest();
    }

    public function test_admin_routes_require_admin_role(): void
    {
        $user = User::create([
            'name' => 'Editor',
            'email' => 'editor@example.com',
            'password' => Hash::make('secret123'),
            'is_admin' => false,
        ]);

        $this->actingAs($user)
            ->getJson('/api/admin/me')
            ->assertForbidden();
    }

    public function test_rich_text_content_is_sanitized_before_persisting(): void
    {
        $page = Page::create([
            'slug' => 'about',
            'title' => ['en' => 'About'],
            'excerpt' => ['en' => 'Summary'],
            'body' => [
                'en' => '<p onclick="alert(1)">Safe</p><script>alert(1)</script><iframe src="https://evil.test"></iframe><a href="javascript:alert(1)">Click</a>',
            ],
            'is_published' => true,
        ]);

        $this->assertStringNotContainsString('<script', $page->body['en']);
        $this->assertStringNotContainsString('onclick=', $page->body['en']);
        $this->assertStringNotContainsString('javascript:', $page->body['en']);
        $this->assertStringContainsString('<p>Safe</p>', $page->body['en']);
        $this->assertStringContainsString('<a>Click</a>', $page->body['en']);
    }
}
