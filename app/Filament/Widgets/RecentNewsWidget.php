<?php

namespace App\Filament\Widgets;

use App\Models\NewsPost;
use Filament\Actions\Action;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class RecentNewsWidget extends TableWidget
{
    protected static ?int $sort = 5;

    protected int|string|array $columnSpan = [
        'default' => 'full',
        'xl' => 2,
    ];

    public function table(Table $table): Table
    {
        return $table
            ->heading('Latest news')
            ->description('Recent announcements and public website updates.')
            ->query(NewsPost::query()->latest('published_at')->limit(6))
            ->columns([
                TextColumn::make('title')
                    ->label('Post')
                    ->state(fn (NewsPost $record): string => $record->localized('title'))
                    ->wrap()
                    ->searchable(),
                TextColumn::make('published_at')
                    ->date()
                    ->sortable(),
                IconColumn::make('is_published')
                    ->label('Live')
                    ->boolean(),
            ])
            ->headerActions([
                Action::make('allNews')
                    ->label('Manage news')
                    ->url('/admin/news-posts')
                    ->icon('heroicon-o-arrow-right'),
            ])
            ->paginated(false);
    }
}
