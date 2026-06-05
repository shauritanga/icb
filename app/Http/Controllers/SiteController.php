<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Event;
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
            'services' => Service::where('is_published', true)->orderBy('sort_order')->get()->map(fn ($s) => $this->service($s)),
            'projects' => Project::where('is_published', true)->where('is_featured', true)->latest()->take(6)->get()->map(fn ($p) => $this->projectData($p)),
            'staff'    => StaffMember::where('is_published', true)->orderBy('sort_order')->take(4)->get()->map(fn ($s) => $this->staffMember($s)),
            'news'     => NewsPost::where('is_published', true)->latest('published_at')->take(3)->get()->map(fn ($p) => $this->postSummary($p)),
            'gallery'  => GalleryItem::where('is_published', true)->orderBy('sort_order')->take(6)->get()->map(fn ($i) => $this->galleryItem($i)),
            'events'   => Event::where('is_published', true)->where('event_date', '>=', now())->orderBy('event_date')->take(3)->get()->map(fn ($e) => $this->eventData($e)),
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function page(Request $request, string $slug): Response
    {
        $this->setLocale($request);

        $page = Page::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Page', [
            'page' => [
                'title'      => $page->localized('title'),
                'excerpt'    => $page->localized('excerpt'),
                'body'       => $page->localized('body'),
                'hero_image' => $this->imageUrl($page->hero_image_path),
            ],
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function services(Request $request): Response
    {
        $this->setLocale($request);

        return Inertia::render('Services', [
            'services' => Service::where('is_published', true)->orderBy('sort_order')->get()->map(fn ($s) => $this->service($s)),
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function projects(Request $request): Response
    {
        $this->setLocale($request);

        $projects = Project::where('is_published', true)->latest()->paginate(9);

        return Inertia::render('Projects', [
            'projects' => [
                'data'  => collect($projects->items())->map(fn ($p) => $this->projectData($p)),
                'links' => $projects->linkCollection(),
            ],
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function project(Request $request, string $slug): Response
    {
        $this->setLocale($request);

        $project = Project::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Project', [
            'project'  => $this->projectData($project),
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function staff(Request $request): Response
    {
        $this->setLocale($request);

        return Inertia::render('Staff', [
            'staff'    => StaffMember::where('is_published', true)->orderBy('sort_order')->get()->map(fn ($s) => $this->staffMember($s)),
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function staffProfile(Request $request, string $slug): Response
    {
        $this->setLocale($request);

        $member = StaffMember::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('StaffProfile', [
            'member'   => $this->staffMember($member),
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function news(Request $request): Response
    {
        $this->setLocale($request);

        $posts = NewsPost::where('is_published', true)->latest('published_at')->paginate(9);

        return Inertia::render('News', [
            'posts' => [
                'data'  => collect($posts->items())->map(fn ($p) => $this->postSummary($p)),
                'links' => $posts->linkCollection(),
            ],
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function post(Request $request, string $slug): Response
    {
        $this->setLocale($request);

        $post = NewsPost::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Post', [
            'post'     => $this->postData($post),
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function events(Request $request): Response
    {
        $this->setLocale($request);

        $events = Event::where('is_published', true)->orderBy('event_date')->paginate(9);

        return Inertia::render('Events', [
            'events' => [
                'data'  => collect($events->items())->map(fn ($e) => $this->eventData($e)),
                'links' => $events->linkCollection(),
            ],
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function event(Request $request, string $slug): Response
    {
        $this->setLocale($request);

        $event = Event::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Event', [
            'event'    => $this->eventData($event),
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    public function contact(Request $request): Response
    {
        $this->setLocale($request);

        return Inertia::render('Contact', [
            'documents' => Document::where('is_published', true)->orderBy('sort_order')->get()->map(fn ($d) => [
                'title'       => $d->localized('title'),
                'description' => $d->localized('description'),
                'url'         => $this->imageUrl($d->file_path),
            ]),
            'settings' => $this->settings(),
            'locale'   => app()->getLocale(),
        ]);
    }

    // ─────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────

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
            'phone'    => SiteSetting::value('phone',    $locale, '+255 752 151118'),
            'email'    => SiteSetting::value('email',    $locale, 'icb@dit.ac.tz'),
            'address'  => SiteSetting::value('address',  $locale, 'Dar es Salaam Institute of Technology, P.O. Box 2958, Dar es Salaam'),
            'website'  => SiteSetting::value('website',  $locale, 'https://www.dit.ac.tz'),
            'facebook'  => SiteSetting::value('social_facebook',  $locale),
            'twitter'   => SiteSetting::value('social_twitter',   $locale),
            'linkedin'  => SiteSetting::value('social_linkedin',  $locale),
            'youtube'   => SiteSetting::value('social_youtube',   $locale),
            'instagram' => SiteSetting::value('social_instagram', $locale),
        ];
    }

    private function service(Service $service): array
    {
        return [
            'title'   => $service->localized('title'),
            'summary' => $service->localized('summary'),
            'body'    => $service->localized('body'),
            'image'   => $this->imageUrl($service->image_path),
            'icon'    => $service->icon,
        ];
    }

    private function projectData(Project $project): array
    {
        $main   = $this->imageUrl($project->image_path);
        $extras = array_map(fn ($p) => $this->imageUrl($p), $project->gallery_images ?? []);
        $images = array_values(array_filter([$main, ...$extras]));

        return [
            'slug'           => $project->slug,
            'title'          => $project->localized('title'),
            'description'    => $project->localized('description'),
            'summary'        => str(strip_tags($project->localized('description')))->limit(160)->toString(),
            'client_name'    => $project->client_name,
            'contract_value' => $project->contract_value,
            'project_period' => $project->project_period,
            'status'         => $project->status,
            'image'          => $main,
            'images'         => $images,
            'url'            => route('projects.show', $project->slug),
        ];
    }

    private function staffMember(StaffMember $staff): array
    {
        $demoImages = [
            'Eng. Dr. Johnson Malisa'       => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&h=1500&fit=crop&crop=faces,entropy&auto=format&q=80',
            'Eng. Dr. Mashauri Kusekwa'     => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=700&fit=crop&crop=faces,entropy&auto=format&q=80',
            'Eng. Prof. Christian Nyahumwa' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=700&fit=crop&crop=faces,entropy&auto=format&q=80',
            'Eng. Julius Chacha'            => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&h=700&fit=crop&crop=faces,entropy&auto=format&q=80',
        ];

        return [
            'id'            => $staff->id,
            'slug'          => $staff->slug,
            'name'          => $staff->name,
            'position'      => $staff->localized('position'),
            'profession'    => $staff->profession,
            'qualification' => $staff->qualification,
            'experience'    => $staff->experience,
            'photo'         => $staff->photo_path
                ? $this->imageUrl($staff->photo_path)
                : ($demoImages[$staff->name] ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1200&fit=crop&crop=faces,entropy&auto=format&q=80'),
            'url'           => $staff->slug ? route('staff.show', $staff->slug) : null,
        ];
    }

    private function postSummary(NewsPost $post): array
    {
        return [
            'slug'         => $post->slug,
            'title'        => $post->localized('title'),
            'excerpt'      => $post->localized('excerpt'),
            'published_at' => $post->published_at?->format('M d, Y'),
            'image'        => $this->imageUrl($post->image_path),
            'url'          => route('news.show', $post->slug),
        ];
    }

    private function postData(NewsPost $post): array
    {
        $main   = $this->imageUrl($post->image_path);
        $extras = array_map(fn ($p) => $this->imageUrl($p), $post->gallery_images ?? []);
        $images = array_values(array_filter([$main, ...$extras]));

        return [
            ...$this->postSummary($post),
            'body'   => $post->localized('body'),
            'image'  => $main,
            'images' => $images,
        ];
    }

    private function galleryItem(GalleryItem $item): array
    {
        return [
            'title'   => $item->localized('title'),
            'caption' => $item->localized('caption'),
            'image'   => $this->imageUrl($item->image_path),
        ];
    }

    private function eventData(Event $event): array
    {
        $main   = $this->imageUrl($event->image_path);
        $extras = array_map(fn ($p) => $this->imageUrl($p), $event->gallery_images ?? []);
        $images = array_values(array_filter([$main, ...$extras]));

        return [
            'slug'              => $event->slug,
            'title'             => $event->localized('title'),
            'description'       => $event->localized('description'),
            'location'          => $event->location,
            'event_date'        => $event->event_date?->format('M d, Y · g:i A'),
            'event_end_date'    => $event->event_end_date?->format('M d, Y · g:i A'),
            'registration_link' => $event->registration_link,
            'image'             => $main,
            'images'            => $images,
            'url'               => route('events.show', $event->slug),
        ];
    }

    private function imageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            $host    = parse_url($path, PHP_URL_HOST);
            $urlPath = parse_url($path, PHP_URL_PATH);

            if (in_array($host, ['localhost', '127.0.0.1'], true) && is_string($urlPath) && str_starts_with($urlPath, '/storage/')) {
                return asset(ltrim($urlPath, '/'));
            }

            return $path;
        }

        if (str_starts_with($path, '/storage/')) {
            return asset(ltrim($path, '/'));
        }

        if (str_starts_with($path, 'demo/')) {
            return asset($path);
        }

        return asset('storage/'.$path);
    }
}
