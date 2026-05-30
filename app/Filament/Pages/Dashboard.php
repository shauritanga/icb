<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\ContentHealthWidget;
use App\Filament\Widgets\ContentStatsWidget;
use App\Filament\Widgets\QuickActionsWidget;
use App\Filament\Widgets\RecentNewsWidget;
use App\Filament\Widgets\RecentProjectsWidget;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $title = 'DIT ICB Dashboard';

    public function getSubheading(): ?string
    {
        return 'Manage institutional content, consultancy services, projects, staff profiles, documents, and public updates.';
    }

    public function getColumns(): int|array
    {
        return [
            'default' => 1,
            'lg' => 2,
            'xl' => 4,
        ];
    }

    public function getWidgets(): array
    {
        return [
            QuickActionsWidget::class,
            ContentStatsWidget::class,
            ContentHealthWidget::class,
            RecentProjectsWidget::class,
            RecentNewsWidget::class,
        ];
    }
}
