<?php

namespace App\Filament\Resources\NewsPosts\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class NewsPostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Publishing')->schema([
                    TextInput::make('slug')->required()->unique(ignoreRecord: true)->maxLength(255),
                    Grid::make(2)->schema([
                        DateTimePicker::make('published_at'),
                        Toggle::make('is_published')->default(true),
                    ]),
                    FileUpload::make('image_path')
                        ->image()
                        ->disk('public')
                        ->directory('news')
                        ->maxSize(5120),
                ]),
                Section::make('English content')->schema([
                    TextInput::make('title.en')->label('Title')->required()->maxLength(255),
                    Textarea::make('excerpt.en')->label('Excerpt')->required()->rows(2),
                    RichEditor::make('body.en')->label('Body')->required(),
                ]),
                Section::make('Swahili content')->schema([
                    TextInput::make('title.sw')->label('Title')->maxLength(255),
                    Textarea::make('excerpt.sw')->label('Excerpt')->rows(2),
                    RichEditor::make('body.sw')->label('Body'),
                ]),
            ]);
    }
}
