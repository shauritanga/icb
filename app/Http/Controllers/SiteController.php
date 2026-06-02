<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\GalleryItem;
use App\Models\NewsPost;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\StaffMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function home(Request $request): Response
    {
        $this->setLocale($request);

        return Inertia::render('Home', [
            'services' => Service::where('is_published', true)->orderBy('sort_order')->get()->map(fn ($service) => $this->service($service)),
            'projects' => Project::where('is_published', true)->where('is_featured', true)->latest()->take(6)->get()->map(fn ($project) => $this->projectData($project)),
            'staff' => StaffMember::where('is_published', true)->orderBy('sort_order')->take(4)->get()->map(fn ($staff) => $this->staffMember($staff)),
            'news' => NewsPost::where('is_published', true)->latest('published_at')->take(3)->get()->map(fn ($post) => $this->postSummary($post)),
            'gallery' => GalleryItem::where('is_published', true)->orderBy('sort_order')->take(6)->get()->map(fn ($item) => $this->galleryItem($item)),
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    public function page(Request $request, string $slug): Response
    {
        $this->setLocale($request);

        $page = Page::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Page', [
            'page' => [
                'title' => $page->localized('title'),
                'excerpt' => $page->localized('excerpt'),
                'body' => $page->localized('body'),
            ],
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    public function services(Request $request): Response
    {
        $this->setLocale($request);

        return Inertia::render('Services', [
            'services' => Service::where('is_published', true)->orderBy('sort_order')->get()->map(fn ($service) => $this->service($service)),
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    public function projects(Request $request): Response
    {
        $this->setLocale($request);

        $projects = Project::where('is_published', true)->latest()->paginate(9);

        return Inertia::render('Projects', [
            'projects' => [
                'data' => collect($projects->items())->map(fn ($project) => $this->projectData($project)),
                'links' => $projects->linkCollection(),
            ],
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    public function project(Request $request, string $slug): Response
    {
        $this->setLocale($request);

        return Inertia::render('Project', [
            'project' => $this->projectData(Project::where('slug', $slug)->where('is_published', true)->firstOrFail()),
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    public function staff(Request $request): Response
    {
        $this->setLocale($request);

        return Inertia::render('Staff', [
            'staff' => StaffMember::where('is_published', true)->orderBy('sort_order')->get()->map(fn ($staff) => $this->staffMember($staff)),
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    public function news(Request $request): Response
    {
        $this->setLocale($request);

        $posts = NewsPost::where('is_published', true)->latest('published_at')->paginate(9);

        return Inertia::render('News', [
            'posts' => [
                'data' => collect($posts->items())->map(fn ($post) => $this->postSummary($post)),
                'links' => $posts->linkCollection(),
            ],
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    public function post(Request $request, string $slug): Response
    {
        $this->setLocale($request);

        return Inertia::render('Post', [
            'post' => $this->postData(NewsPost::where('slug', $slug)->where('is_published', true)->firstOrFail()),
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    public function contact(Request $request): Response
    {
        $this->setLocale($request);

        return Inertia::render('Contact', [
            'documents' => Document::where('is_published', true)->orderBy('sort_order')->get()->map(fn ($document) => [
                'title' => $document->localized('title'),
                'description' => $document->localized('description'),
                'url' => $document->file_path ? asset('storage/'.$document->file_path) : null,
            ]),
            'settings' => $this->settings(),
            'locale' => app()->getLocale(),
        ]);
    }

    private function setLocale(Request $request): void
    {
        $locale = $request->query('lang', session('locale', 'en'));

        if (! in_array($locale, ['en', 'sw'], true)) {
            $locale = 'en';
        }

        session(['locale' => $locale]);
        app()->setLocale($locale);
    }

    private function settings(): array
    {
        $locale = app()->getLocale();

        return [
            'phone' => SiteSetting::value('phone', $locale, '+255 752 151118'),
            'email' => SiteSetting::value('email', $locale, 'icb@dit.ac.tz'),
            'address' => SiteSetting::value('address', $locale, 'Dar es Salaam Institute of Technology, P.O. Box 2958, Dar es Salaam'),
            'website' => SiteSetting::value('website', $locale, 'https://www.dit.ac.tz'),
        ];
    }

    private function service(Service $service): array
    {
        return [
            'title' => $service->localized('title'),
            'summary' => $service->localized('summary'),
            'body' => $service->localized('body'),
            'image' => $this->imageUrl($service->image_path),
            'icon' => $service->icon,
        ];
    }

    private function projectData(Project $project): array
    {
        $main = $this->imageUrl($project->image_path);
        $extras = array_map(fn ($p) => $this->imageUrl($p), $project->gallery_images ?? []);
        $images = array_values(array_filter([$main, ...$extras]));

        return [
            'slug' => $project->slug,
            'title' => $project->localized('title'),
            'description' => $project->localized('description'),
            'summary' => str(strip_tags($project->localized('description')))->limit(160)->toString(),
            'client_name' => $project->client_name,
            'contract_value' => $project->contract_value,
            'project_period' => $project->project_period,
            'status' => $project->status,
            'image' => $main,
            'images' => $images,
            'url' => route('projects.show', $project->slug),
        ];
    }

    private function staffMember(StaffMember $staff): array
    {
        $demoImages = [
            'Eng. Dr. Johnson Malisa' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&h=1500&fit=crop&crop=faces,entropy&auto=format&q=80',
            'Eng. Dr. Mashauri Kusekwa' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=700&fit=crop&crop=faces,entropy&auto=format&q=80',
            'Eng. Prof. Christian Nyahumwa' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=700&fit=crop&crop=faces,entropy&auto=format&q=80',
            'Eng. Julius Chacha' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&h=700&fit=crop&crop=faces,entropy&auto=format&q=80',
        ];

        return [
            'name' => $staff->name,
            'position' => $staff->localized('position'),
            'profession' => $staff->profession,
            'qualification' => $staff->qualification,
            'experience' => $staff->experience,
            'photo' => $staff->photo_path ? asset('storage/'.$staff->photo_path) : ($demoImages[$staff->name] ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1200&fit=crop&crop=faces,entropy&auto=format&q=80'),
        ];
    }

    private function postSummary(NewsPost $post): array
    {
        return [
            'slug' => $post->slug,
            'title' => $post->localized('title'),
            'excerpt' => $post->localized('excerpt'),
            'published_at' => $post->published_at?->format('M d, Y'),
            'image' => $this->imageUrl($post->image_path),
            'url' => route('news.show', $post->slug),
        ];
    }

    private function postData(NewsPost $post): array
    {
        return [
            ...$this->postSummary($post),
            'body' => $post->localized('body'),
            'image' => $post->image_path ? asset('storage/'.$post->image_path) : null,
        ];
    }

    private function galleryItem(GalleryItem $item): array
    {
        return [
            'title' => $item->localized('title'),
            'caption' => $item->localized('caption'),
            'image' => $item->image_path ? asset('storage/'.$item->image_path) : null,
        ];
    }

    private function imageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (str_starts_with($path, 'demo/')) {
            return asset($path);
        }

        return asset('storage/'.$path);
    }
}
