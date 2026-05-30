<?php

namespace App\Filament\Resources\Services\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('English content')->schema([
                    TextInput::make('title.en')->label('Title')->required()->maxLength(255),
                    Textarea::make('summary.en')->label('Summary')->required()->rows(3),
                    RichEditor::make('body.en')->label('Details')->columnSpanFull(),
                ])->columns(2),
                Section::make('Swahili content')->schema([
                    TextInput::make('title.sw')->label('Title')->maxLength(255),
                    Textarea::make('summary.sw')->label('Summary')->rows(3),
                    RichEditor::make('body.sw')->label('Details')->columnSpanFull(),
                ])->columns(2),
                Section::make('Display')->schema([
                    Grid::make(2)->schema([
                        TextInput::make('icon')->placeholder('building-office')->maxLength(255),
                        TextInput::make('sort_order')->numeric()->default(0),
                        Toggle::make('is_featured')->label('Featured')->default(false),
                        Toggle::make('is_published')->label('Published')->default(true),
                    ]),
                    FileUpload::make('image_path')->label('Image')->image()->directory('services'),
                ]),
            ]);
    }
}
