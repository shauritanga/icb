<?php

namespace App\Filament\Widgets;

use App\Models\Document;
use App\Models\NewsPost;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\StaffMember;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ContentStatsWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 2;

    protected ?string $heading = 'Content overview';

    protected ?string $description = 'Live CMS records available for the public website.';

    protected int|string|array $columnSpan = 'full';

    protected function getStats(): array
    {
        return [
            Stat::make('Published pages', Page::where('is_published', true)->count())
                ->description(Page::count().' total pages')
                ->descriptionIcon(Heroicon::OutlinedDocumentText)
                ->color('primary')
                ->chart([2, 3, 3, 4, 4, Page::count()]),
            Stat::make('Services', Service::where('is_published', true)->count())
                ->description('Consultancy areas')
                ->descriptionIcon(Heroicon::OutlinedWrenchScrewdriver)
                ->color('info')
                ->chart([1, 2, 3, 4, 5, Service::count()]),
            Stat::make('Projects', Project::where('is_published', true)->count())
                ->description(Project::where('is_featured', true)->count().' featured')
                ->descriptionIcon(Heroicon::OutlinedBriefcase)
                ->color('success')
                ->chart([2, 3, 4, 5, 6, Project::count()]),
            Stat::make('Team profiles', StaffMember::where('is_published', true)->count())
                ->description('Public staff records')
                ->descriptionIcon(Heroicon::OutlinedUserGroup)
                ->color('warning')
                ->chart([2, 3, 4, 5, 6, StaffMember::count()]),
            Stat::make('News posts', NewsPost::where('is_published', true)->count())
                ->description('Published updates')
                ->descriptionIcon(Heroicon::OutlinedNewspaper)
                ->color('gray')
                ->chart([0, 1, 1, 2, 2, NewsPost::count()]),
            Stat::make('Documents', Document::where('is_published', true)->count())
                ->description('Public downloads')
                ->descriptionIcon(Heroicon::OutlinedFolderOpen)
                ->color('primary')
                ->chart([0, 0, 1, 1, 2, Document::count()]),
        ];
    }
}
