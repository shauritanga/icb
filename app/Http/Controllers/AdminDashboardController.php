<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\GalleryItem;
use App\Models\NewsPost;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\StaffMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if (! $request->user()) {
            return redirect('/admin/login');
        }

        $health = [
            $this->health('Core pages', Page::where('is_published', true)->count(), 2, '/admin/pages'),
            $this->health('Services', Service::where('is_published', true)->count(), 6, '/admin/services'),
            $this->health('Featured projects', Project::where('is_featured', true)->where('is_published', true)->count(), 4, '/admin/projects'),
            $this->health('Team profiles', StaffMember::where('is_published', true)->count(), 4, '/admin/staff-members'),
            $this->health('News updates', NewsPost::where('is_published', true)->count(), 1, '/admin/news-posts'),
            $this->health('Gallery images', GalleryItem::where('is_published', true)->count(), 3, '/admin/gallery-items'),
            $this->health('Documents', Document::where('is_published', true)->count(), 1, '/admin/documents'),
        ];

        return Inertia::render('Admin/Dashboard', [
            'user' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ],
            'stats' => [
                ['label' => 'Published pages', 'value' => Page::where('is_published', true)->count(), 'meta' => Page::count().' total records', 'url' => '/admin/pages'],
                ['label' => 'Services', 'value' => Service::where('is_published', true)->count(), 'meta' => 'Consultancy areas', 'url' => '/admin/services'],
                ['label' => 'Projects', 'value' => Project::where('is_published', true)->count(), 'meta' => Project::where('is_featured', true)->count().' featured', 'url' => '/admin/projects'],
                ['label' => 'Staff profiles', 'value' => StaffMember::where('is_published', true)->count(), 'meta' => 'Public team records', 'url' => '/admin/staff-members'],
                ['label' => 'News posts', 'value' => NewsPost::where('is_published', true)->count(), 'meta' => 'Published updates', 'url' => '/admin/news-posts'],
                ['label' => 'Documents', 'value' => Document::where('is_published', true)->count(), 'meta' => 'Public downloads', 'url' => '/admin/documents'],
            ],
            'health' => $health,
            'projects' => Project::latest()->take(5)->get()->map(fn (Project $project) => [
                'title' => $project->localized('title'),
                'client' => $project->client_name ?: 'Not specified',
                'status' => $project->status ?: 'Draft',
                'published' => $project->is_published,
            ]),
            'news' => NewsPost::latest('published_at')->take(5)->get()->map(fn (NewsPost $post) => [
                'title' => $post->localized('title'),
                'date' => $post->published_at?->format('M d, Y') ?: 'Draft',
                'published' => $post->is_published,
            ]),
        ]);
    }

    private function health(string $label, int $value, int $target, string $url): array
    {
        $percent = min(100, (int) round(($value / max(1, $target)) * 100));

        return [
            'label' => $label,
            'value' => $value,
            'target' => $target,
            'percent' => $percent,
            'status' => $percent >= 100 ? 'Ready' : 'Needs content',
            'url' => $url,
        ];
    }
}
