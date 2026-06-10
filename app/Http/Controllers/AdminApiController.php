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
use App\Models\User;
use App\Services\TranslationService;
use App\Support\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AdminApiController extends Controller
{
    private array $resources = [
        'pages' => [
            'model' => Page::class,
            'title' => 'Pages',
            'description' => 'Manage static website pages and bilingual body content.',
            'search' => 'slug',
            'fields' => [
                ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'required' => true],
                ['name' => 'title.en', 'label' => 'Title EN', 'type' => 'text', 'required' => true],
                ['name' => 'title.sw', 'label' => 'Title SW', 'type' => 'text'],
                ['name' => 'excerpt.en', 'label' => 'Excerpt EN', 'type' => 'textarea'],
                ['name' => 'excerpt.sw', 'label' => 'Excerpt SW', 'type' => 'textarea'],
                ['name' => 'body.en', 'label' => 'Body EN', 'type' => 'richtext', 'required' => true],
                ['name' => 'body.sw', 'label' => 'Body SW', 'type' => 'richtext'],
                ['name' => 'hero_image_path', 'label' => 'Hero Image', 'type' => 'image'],
                ['name' => 'is_published', 'label' => 'Published', 'type' => 'boolean'],
            ],
        ],
        'services' => [
            'model' => Service::class,
            'title' => 'Services',
            'description' => 'Manage consultancy services shown on the public website.',
            'search' => 'title->en',
            'fields' => [
                ['name' => 'title.en', 'label' => 'Title EN', 'type' => 'text', 'required' => true],
                ['name' => 'title.sw', 'label' => 'Title SW', 'type' => 'text'],
                ['name' => 'summary.en', 'label' => 'Summary EN', 'type' => 'textarea', 'required' => true],
                ['name' => 'summary.sw', 'label' => 'Summary SW', 'type' => 'textarea'],
                ['name' => 'body.en', 'label' => 'Details EN', 'type' => 'richtext'],
                ['name' => 'body.sw', 'label' => 'Details SW', 'type' => 'richtext'],
                ['name' => 'icon', 'label' => 'Icon name', 'type' => 'text'],
                ['name' => 'image_path', 'label' => 'Image', 'type' => 'image'],
                ['name' => 'sort_order', 'label' => 'Sort order', 'type' => 'number'],
                ['name' => 'is_featured', 'label' => 'Featured', 'type' => 'boolean'],
                ['name' => 'is_published', 'label' => 'Published', 'type' => 'boolean'],
            ],
        ],
        'projects' => [
            'model' => Project::class,
            'title' => 'Projects',
            'description' => 'Manage selected consultancy assignments and project details.',
            'search' => 'slug',
            'fields' => [
                ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'required' => true],
                ['name' => 'title.en', 'label' => 'Title EN', 'type' => 'text', 'required' => true],
                ['name' => 'title.sw', 'label' => 'Title SW', 'type' => 'text'],
                ['name' => 'description.en', 'label' => 'Description EN', 'type' => 'richtext', 'required' => true],
                ['name' => 'description.sw', 'label' => 'Description SW', 'type' => 'richtext'],
                ['name' => 'client_name', 'label' => 'Client', 'type' => 'text'],
                ['name' => 'contract_value', 'label' => 'Contract value', 'type' => 'text'],
                ['name' => 'project_period', 'label' => 'Project period', 'type' => 'text'],
                ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => ['ongoing', 'completed', 'planned']],
                ['name' => 'image_path', 'label' => 'Image', 'type' => 'image'],
                ['name' => 'gallery_images', 'label' => 'Gallery Images', 'type' => 'images'],
                ['name' => 'is_featured', 'label' => 'Featured', 'type' => 'boolean'],
                ['name' => 'is_published', 'label' => 'Published', 'type' => 'boolean'],
            ],
        ],
        'staff' => [
            'model' => StaffMember::class,
            'title' => 'Staff',
            'description' => 'Manage bureau leadership and professional profiles.',
            'search' => 'name',
            'fields' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                ['name' => 'slug', 'label' => 'Slug (URL — e.g. fimbombaya)', 'type' => 'text'],
                ['name' => 'position.en', 'label' => 'Position EN', 'type' => 'text', 'required' => true],
                ['name' => 'position.sw', 'label' => 'Position SW', 'type' => 'text'],
                ['name' => 'profession', 'label' => 'Profession', 'type' => 'text'],
                ['name' => 'qualification', 'label' => 'Qualification', 'type' => 'text'],
                ['name' => 'experience', 'label' => 'Experience', 'type' => 'text'],
                ['name' => 'photo_path', 'label' => 'Photo', 'type' => 'image'],
                ['name' => 'sort_order', 'label' => 'Sort order', 'type' => 'number'],
                ['name' => 'is_published', 'label' => 'Published', 'type' => 'boolean'],
            ],
        ],
        'news' => [
            'model' => NewsPost::class,
            'title' => 'News',
            'description' => 'Manage public updates and announcements.',
            'search' => 'slug',
            'fields' => [
                ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'required' => true],
                ['name' => 'title.en', 'label' => 'Title EN', 'type' => 'text', 'required' => true],
                ['name' => 'title.sw', 'label' => 'Title SW', 'type' => 'text'],
                ['name' => 'excerpt.en', 'label' => 'Excerpt EN', 'type' => 'textarea', 'required' => true],
                ['name' => 'excerpt.sw', 'label' => 'Excerpt SW', 'type' => 'textarea'],
                ['name' => 'body.en', 'label' => 'Body EN', 'type' => 'richtext', 'required' => true],
                ['name' => 'body.sw', 'label' => 'Body SW', 'type' => 'richtext'],
                ['name' => 'image_path', 'label' => 'Featured Image', 'type' => 'image'],
                ['name' => 'gallery_images', 'label' => 'Gallery Images', 'type' => 'images'],
                ['name' => 'published_at', 'label' => 'Published at', 'type' => 'datetime'],
                ['name' => 'is_published', 'label' => 'Published', 'type' => 'boolean'],
            ],
        ],
        'gallery' => [
            'model' => GalleryItem::class,
            'title' => 'Gallery',
            'description' => 'Manage image gallery captions and visibility.',
            'search' => 'title->en',
            'fields' => [
                ['name' => 'title.en', 'label' => 'Title EN', 'type' => 'text', 'required' => true],
                ['name' => 'title.sw', 'label' => 'Title SW', 'type' => 'text'],
                ['name' => 'caption.en', 'label' => 'Caption EN', 'type' => 'textarea'],
                ['name' => 'caption.sw', 'label' => 'Caption SW', 'type' => 'textarea'],
                ['name' => 'image_path', 'label' => 'Image', 'type' => 'image', 'required' => true],
                ['name' => 'sort_order', 'label' => 'Sort order', 'type' => 'number'],
                ['name' => 'is_published', 'label' => 'Published', 'type' => 'boolean'],
            ],
        ],
        'documents' => [
            'model' => Document::class,
            'title' => 'Documents',
            'description' => 'Manage public downloads and bureau documents.',
            'search' => 'title->en',
            'fields' => [
                ['name' => 'title.en', 'label' => 'Title EN', 'type' => 'text', 'required' => true],
                ['name' => 'title.sw', 'label' => 'Title SW', 'type' => 'text'],
                ['name' => 'description.en', 'label' => 'Description EN', 'type' => 'textarea'],
                ['name' => 'description.sw', 'label' => 'Description SW', 'type' => 'textarea'],
                ['name' => 'file_path', 'label' => 'File', 'type' => 'file', 'required' => true],
                ['name' => 'sort_order', 'label' => 'Sort order', 'type' => 'number'],
                ['name' => 'is_published', 'label' => 'Published', 'type' => 'boolean'],
            ],
        ],
        'events' => [
            'model' => Event::class,
            'title' => 'Events',
            'description' => 'Manage bureau events, workshops, and public engagements.',
            'search' => 'slug',
            'fields' => [
                ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'required' => true],
                ['name' => 'title.en', 'label' => 'Title EN', 'type' => 'text', 'required' => true],
                ['name' => 'title.sw', 'label' => 'Title SW', 'type' => 'text'],
                ['name' => 'description.en', 'label' => 'Description EN', 'type' => 'richtext'],
                ['name' => 'description.sw', 'label' => 'Description SW', 'type' => 'richtext'],
                ['name' => 'location', 'label' => 'Location', 'type' => 'text'],
                ['name' => 'event_date', 'label' => 'Event date', 'type' => 'datetime'],
                ['name' => 'event_end_date', 'label' => 'End date (optional)', 'type' => 'datetime'],
                ['name' => 'registration_link', 'label' => 'Registration link', 'type' => 'text'],
                ['name' => 'image_path', 'label' => 'Featured Image', 'type' => 'image'],
                ['name' => 'gallery_images', 'label' => 'Gallery Images', 'type' => 'images'],
                ['name' => 'is_published', 'label' => 'Published', 'type' => 'boolean'],
            ],
        ],
        'settings' => [
            'model' => SiteSetting::class,
            'title' => 'Settings',
            'description' => 'Manage website contact and global settings.',
            'search' => 'key',
            'fields' => [
                ['name' => 'key', 'label' => 'Key', 'type' => 'text', 'required' => true],
                ['name' => 'value.en', 'label' => 'Value EN', 'type' => 'textarea'],
                ['name' => 'value.sw', 'label' => 'Value SW', 'type' => 'textarea'],
            ],
        ],
    ];

    /** English field → Swahili field mappings per resource for auto-translation. */
    private array $translatableFields = [
        'pages'     => ['title.en' => 'title.sw', 'excerpt.en' => 'excerpt.sw', 'body.en' => 'body.sw', 'meta_title.en' => 'meta_title.sw', 'meta_description.en' => 'meta_description.sw'],
        'services'  => ['title.en' => 'title.sw', 'summary.en' => 'summary.sw', 'body.en' => 'body.sw'],
        'projects'  => ['title.en' => 'title.sw', 'description.en' => 'description.sw'],
        'news'      => ['title.en' => 'title.sw', 'excerpt.en' => 'excerpt.sw', 'body.en' => 'body.sw'],
        'events'    => ['title.en' => 'title.sw', 'description.en' => 'description.sw'],
        'staff'     => ['position.en' => 'position.sw'],
        'gallery'   => ['title.en' => 'title.sw', 'caption.en' => 'caption.sw'],
        'documents' => ['title.en' => 'title.sw', 'description.en' => 'description.sw'],
    ];

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            Log::channel('security')->warning('Admin login failed: invalid credentials.', [
                'email' => $credentials['email'],
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            usleep(250000);

            throw ValidationException::withMessages(['email' => 'The provided credentials are incorrect.']);
        }

        if (! $user->is_admin) {
            Log::channel('security')->warning('Admin login denied for non-admin user.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            usleep(250000);

            throw ValidationException::withMessages(['email' => 'The provided credentials are incorrect.']);
        }

        Auth::login($user);
        $request->session()->regenerate();

        Log::channel('security')->notice('Admin login succeeded.', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['user' => $this->userData($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        Log::channel('security')->notice('Admin logout.', [
            'user_id' => $user?->id,
            'email' => $user?->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->userData($request->user())]);
    }

    public function dashboard(): JsonResponse
    {
        return response()->json([
            'stats' => [
                ['label' => 'Published pages', 'value' => Page::where('is_published', true)->count(), 'meta' => Page::count().' total records', 'resource' => 'pages'],
                ['label' => 'Services', 'value' => Service::where('is_published', true)->count(), 'meta' => 'Consultancy areas', 'resource' => 'services'],
                ['label' => 'Projects', 'value' => Project::where('is_published', true)->count(), 'meta' => Project::where('is_featured', true)->count().' featured', 'resource' => 'projects'],
                ['label' => 'Staff profiles', 'value' => StaffMember::where('is_published', true)->count(), 'meta' => 'Public team records', 'resource' => 'staff'],
                ['label' => 'News posts', 'value' => NewsPost::where('is_published', true)->count(), 'meta' => 'Published updates', 'resource' => 'news'],
                ['label' => 'Documents', 'value' => Document::where('is_published', true)->count(), 'meta' => 'Public downloads', 'resource' => 'documents'],
                ['label' => 'Events', 'value' => Event::where('is_published', true)->count(), 'meta' => 'Upcoming & past', 'resource' => 'events'],
            ],
            'health' => [
                $this->health('Core pages', Page::where('is_published', true)->count(), 2, 'pages'),
                $this->health('Services', Service::where('is_published', true)->count(), 6, 'services'),
                $this->health('Featured projects', Project::where('is_featured', true)->where('is_published', true)->count(), 4, 'projects'),
                $this->health('Team profiles', StaffMember::where('is_published', true)->count(), 4, 'staff'),
                $this->health('News updates', NewsPost::where('is_published', true)->count(), 1, 'news'),
                $this->health('Gallery images', GalleryItem::where('is_published', true)->count(), 3, 'gallery'),
                $this->health('Documents', Document::where('is_published', true)->count(), 1, 'documents'),
                $this->health('Events', Event::where('is_published', true)->count(), 1, 'events'),
            ],
            'projects' => Project::latest()->take(5)->get()->map(fn (Project $project) => [
                'title' => $project->localized('title'),
                'client' => $project->client_name ?: 'Not specified',
                'status' => $project->status ?: 'Draft',
                'published' => $project->is_published,
                'image' => $this->resolveImageUrl($project->image_path),
            ]),
            'news' => NewsPost::latest('published_at')->take(5)->get()->map(fn (NewsPost $post) => [
                'title' => $post->localized('title'),
                'date' => $post->published_at?->format('M d, Y') ?: 'Draft',
                'published' => $post->is_published,
                'image' => $this->resolveImageUrl($post->image_path),
            ]),
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx,zip'],
        ]);

        $path = $request->file('file')->store('uploads', 'public');

        Log::channel('security')->notice('Admin file uploaded.', [
            'path' => $path,
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $this->requireAdminRole($request);

        $query = User::query()->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        return response()->json([
            'users' => $query->get()->map(fn (User $u) => $this->serializeUser($u)),
        ]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $this->requireAdminRole($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,editor'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'is_admin' => $data['role'] === 'admin',
        ]);

        Log::channel('security')->notice('Admin created user.', [
            'new_user_id' => $user->id,
            'email' => $user->email,
            'admin_id' => $request->user()?->id,
            'ip' => $request->ip(),
        ]);

        return response()->json(['user' => $this->serializeUser($user)], 201);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $this->requireAdminRole($request);

        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,editor'],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role = $data['role'];
        $user->is_admin = $data['role'] === 'admin';

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        Log::channel('security')->notice('Admin updated user.', [
            'target_user_id' => $user->id,
            'admin_id' => $request->user()?->id,
            'ip' => $request->ip(),
        ]);

        return response()->json(['user' => $this->serializeUser($user)]);
    }

    public function destroyUser(Request $request, int $id): JsonResponse
    {
        $this->requireAdminRole($request);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()?->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        Log::channel('security')->notice('Admin deleted user.', [
            'target_user_id' => $user->id,
            'email' => $user->email,
            'admin_id' => $request->user()?->id,
            'ip' => $request->ip(),
        ]);

        $user->delete();

        return response()->json(['ok' => true]);
    }

    public function index(Request $request, string $resource): JsonResponse
    {
        $config = $this->resource($resource);
        $query = $config['model']::query()->latest();

        if ($search = $request->query('search')) {
            $query->where($config['search'], 'like', '%'.$search.'%');
        }

        $paginator = $query->paginate(12);
        $paginator->through(fn ($model) => $this->serialize($model));

        return response()->json([
            'config' => $this->publicConfig($resource, $config),
            'items' => $paginator,
        ]);
    }

    public function show(string $resource, int $id): JsonResponse
    {
        $config = $this->resource($resource);

        return response()->json([
            'config' => $this->publicConfig($resource, $config),
            'item' => $this->serialize($config['model']::findOrFail($id)),
        ]);
    }

    public function store(Request $request, string $resource): JsonResponse
    {
        $config = $this->resource($resource);
        $this->validatePayload($request, $config);
        $data = $this->payload($request, $config);
        $data = $this->applyAutoTranslation($resource, $data);
        $model = new $config['model']();
        $model->fill($data);
        $model->save();
        $this->logAdminAction($request, 'created', $resource, $model);

        return response()->json(['item' => $this->serialize($model)], 201);
    }

    public function update(Request $request, string $resource, int $id): JsonResponse
    {
        $config = $this->resource($resource);
        $this->validatePayload($request, $config, $id);
        $model = $config['model']::findOrFail($id);
        $data = $this->payload($request, $config);
        $data = $this->applyAutoTranslation($resource, $data, $model);
        $model->fill($data);
        $model->save();
        $this->logAdminAction($request, 'updated', $resource, $model);

        return response()->json(['item' => $this->serialize($model)]);
    }

    public function destroy(Request $request, string $resource, int $id): JsonResponse
    {
        $config = $this->resource($resource);
        $model = $config['model']::findOrFail($id);
        $this->logAdminAction($request, 'deleted', $resource, $model);
        $model->delete();

        return response()->json(['ok' => true]);
    }

    private function resource(string $resource): array
    {
        abort_unless(isset($this->resources[$resource]), 404);

        return $this->resources[$resource];
    }

    private function publicConfig(string $resource, array $config): array
    {
        return collect($config)->only(['title', 'description', 'fields'])->put('resource', $resource)->all();
    }

    private function validatePayload(Request $request, array $config, ?int $ignoreId = null): void
    {
        $rules = [];

        foreach ($config['fields'] as $field) {
            $key = str_replace('.', '_', $field['name']);
            $fieldRules = [];

            if (! empty($field['required'])) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            match ($field['type']) {
                'number' => array_push($fieldRules, 'integer', 'min:0'),
                'datetime' => $fieldRules[] = 'date',
                'image', 'file' => array_push($fieldRules, 'string', 'max:2048'),
                'images' => $fieldRules[] = 'string',
                'text', 'textarea', 'richtext' => $fieldRules[] = 'max:65535',
                default => null,
            };

            if ($field['name'] === 'slug') {
                $table = (new $config['model'])->getTable();
                $uniqueRule = "unique:{$table},slug" . ($ignoreId ? ",{$ignoreId}" : '');
                array_push($fieldRules, 'regex:/^[a-z0-9\-]+$/', 'max:200', $uniqueRule);
            }

            $rules[$key] = implode('|', $fieldRules);
        }

        $flat = [];
        foreach ($request->all() as $topKey => $topValue) {
            $this->flattenInput($flat, $topKey, $topValue);
        }

        validator($flat, $rules)->validate();
    }

    private function flattenInput(array &$out, string $prefix, mixed $value): void
    {
        if (is_array($value)) {
            foreach ($value as $k => $v) {
                $this->flattenInput($out, "{$prefix}_{$k}", $v);
            }
        } else {
            $out[$prefix] = $value;
        }
    }

    private function payload(Request $request, array $config): array
    {
        $data = [];

        foreach ($config['fields'] as $field) {
            $raw = data_get($request->all(), $field['name']);

            if ($field['type'] === 'boolean') {
                $raw = $raw ?? false;
            }

            if ($field['type'] === 'richtext' && is_string($raw)) {
                $raw = HtmlSanitizer::richText($raw);
            }

            if ($field['type'] === 'images' && is_string($raw)) {
                $raw = json_decode($raw, true) ?? [];
            }

            data_set($data, $field['name'], $raw);
        }

        return $data;
    }

    private function applyAutoTranslation(string $resource, array $data, ?Model $existing = null): array
    {
        $map = $this->translatableFields[$resource] ?? [];

        if (empty($map)) {
            return $data;
        }

        $toTranslate = [];

        foreach ($map as $enField => $swField) {
            $newEnValue = data_get($data, $enField);

            if (! is_string($newEnValue) || trim($newEnValue) === '') {
                continue;
            }

            $oldEnValue = $existing ? data_get($existing->toArray(), $enField) : null;

            if ($existing !== null && $newEnValue === $oldEnValue) {
                continue;
            }

            $toTranslate[$swField] = $newEnValue;
        }

        if (! empty($toTranslate)) {
            $translator = app(TranslationService::class);
            $translations = $translator->translateBatch($toTranslate);

            foreach ($translations as $swField => $translatedValue) {
                data_set($data, $swField, $translatedValue);
            }
        }

        return $data;
    }

    private function logAdminAction(Request $request, string $action, string $resource, Model $model): void
    {
        $user = $request->user();

        Log::channel('security')->notice("Admin resource {$action}.", [
            'action' => $action,
            'resource' => $resource,
            'record_id' => $model->getKey(),
            'record_title' => $this->serialize($model)['display_title'],
            'user_id' => $user?->id,
            'email' => $user?->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    private function serialize(Model $model): array
    {
        $data = $model->toArray();
        $data['display_title'] = method_exists($model, 'localized')
            ? ($model->localized('title') ?: $model->localized('position') ?: ($model->name ?? $model->slug ?? $model->key ?? 'Record'))
            : ($model->name ?? $model->slug ?? $model->key ?? 'Record');

        return $data;
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => (bool) $user->is_admin,
            'role' => $user->role ?? ($user->is_admin ? 'admin' : null),
        ];
    }

    private function userData(User $user): array
    {
        return ['name' => $user->name, 'email' => $user->email, 'role' => $user->role ?? ($user->is_admin ? 'admin' : 'editor')];
    }

    private function resolveImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        // Already an absolute URL — use as-is
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    private function requireAdminRole(Request $request): void
    {
        $user = $request->user();
        if (! $user?->is_admin && $user?->role !== 'admin') {
            abort(403, 'Admin role required for this action.');
        }
    }

    private function health(string $label, int $value, int $target, string $resource): array
    {
        $percent = min(100, (int) round(($value / max(1, $target)) * 100));

        return compact('label', 'value', 'target', 'percent', 'resource') + [
            'status' => $percent >= 100 ? 'Ready' : 'Needs content',
        ];
    }
}
