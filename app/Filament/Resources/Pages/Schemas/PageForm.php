<?php

namespace App\Filament\Resources\Pages\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class PageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Page details')->schema([
                    TextInput::make('slug')->required()->unique(ignoreRecord: true)->maxLength(255),
                    Toggle::make('is_published')->default(true),
                    FileUpload::make('hero_image_path')->label('Hero image')->image()->directory('pages')->columnSpanFull(),
                ])->columns(2),
                Section::make('English content')->schema([
                    TextInput::make('title.en')->label('Title')->required()->maxLength(255),
                    Textarea::make('excerpt.en')->label('Excerpt')->rows(2),
                    RichEditor::make('body.en')->label('Body')->required()->columnSpanFull(),
                ])->columns(2),
                Section::make('Swahili content')->schema([
                    TextInput::make('title.sw')->label('Title')->maxLength(255),
                    Textarea::make('excerpt.sw')->label('Excerpt')->rows(2),
                    RichEditor::make('body.sw')->label('Body')->columnSpanFull(),
                ])->columns(2),
            ]);
    }
}
