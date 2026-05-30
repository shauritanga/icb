<?php

namespace App\Filament\Widgets;

use App\Models\Document;
use App\Models\GalleryItem;
use App\Models\NewsPost;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\StaffMember;
use Filament\Widgets\Widget;

class ContentHealthWidget extends Widget
{
    protected static ?int $sort = 3;

    protected string $view = 'filament.widgets.content-health-widget';

    protected int|string|array $columnSpan = 'full';

    protected function getViewData(): array
    {
        $checks = [
            [
                'label' => 'Core pages published',
                'value' => Page::where('is_published', true)->count(),
                'target' => 2,
                'url' => '/admin/pages',
            ],
            [
                'label' => 'Services available',
                'value' => Service::where('is_published', true)->count(),
                'target' => 6,
                'url' => '/admin/services',
            ],
            [
                'label' => 'Featured projects',
                'value' => Project::where('is_featured', true)->where('is_published', true)->count(),
                'target' => 4,
                'url' => '/admin/projects',
            ],
            [
                'label' => 'Team profiles',
                'value' => StaffMember::where('is_published', true)->count(),
                'target' => 4,
                'url' => '/admin/staff-members',
            ],
            [
                'label' => 'News updates',
                'value' => NewsPost::where('is_published', true)->count(),
                'target' => 1,
                'url' => '/admin/news-posts',
            ],
            [
                'label' => 'Gallery images',
                'value' => GalleryItem::where('is_published', true)->count(),
                'target' => 3,
                'url' => '/admin/gallery-items',
            ],
            [
                'label' => 'Public documents',
                'value' => Document::where('is_published', true)->count(),
                'target' => 1,
                'url' => '/admin/documents',
            ],
        ];

        return [
            'checks' => collect($checks)->map(function (array $check): array {
                $percent = min(100, (int) round(($check['value'] / max(1, $check['target'])) * 100));

                return [
                    ...$check,
                    'percent' => $percent,
                    'status' => $percent >= 100 ? 'Ready' : 'Needs content',
                ];
            }),
        ];
    }
}
