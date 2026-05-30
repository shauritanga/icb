<?php

namespace App\Filament\Widgets;

use App\Models\Project;
use Filament\Actions\Action;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class RecentProjectsWidget extends TableWidget
{
    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = [
        'default' => 'full',
        'xl' => 2,
    ];

    public function table(Table $table): Table
    {
        return $table
            ->heading('Recent projects')
            ->description('Latest consultancy assignments shown or ready for publication.')
            ->query(Project::query()->latest()->limit(6))
            ->columns([
                TextColumn::make('title')
                    ->label('Project')
                    ->state(fn (Project $record): string => $record->localized('title'))
                    ->searchable()
                    ->wrap(),
                TextColumn::make('client_name')
                    ->label('Client')
                    ->placeholder('Not specified')
                    ->toggleable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'Completed', 'Design Completed' => 'success',
                        'Ongoing', 'Supervision in Progress' => 'warning',
                        default => 'gray',
                    }),
                IconColumn::make('is_published')
                    ->label('Live')
                    ->boolean(),
            ])
            ->headerActions([
                Action::make('allProjects')
                    ->label('Manage projects')
                    ->url('/admin/projects')
                    ->icon('heroicon-o-arrow-right'),
            ])
            ->paginated(false);
    }
}
