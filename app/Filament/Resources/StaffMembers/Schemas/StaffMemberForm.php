<?php

namespace App\Filament\Resources\StaffMembers\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class StaffMemberForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Staff profile')->schema([
                    TextInput::make('name')->required()->maxLength(255),
                    Grid::make(2)->schema([
                        TextInput::make('position.en')->label('Position EN')->required()->maxLength(255),
                        TextInput::make('position.sw')->label('Position SW')->maxLength(255),
                        TextInput::make('profession')->maxLength(255),
                        TextInput::make('qualification')->maxLength(255),
                        TextInput::make('experience')->maxLength(255),
                        TextInput::make('sort_order')->numeric()->default(0),
                        Toggle::make('is_published')->default(true),
                    ]),
                    FileUpload::make('photo_path')->image()->directory('staff'),
                ]),
            ]);
    }
}
