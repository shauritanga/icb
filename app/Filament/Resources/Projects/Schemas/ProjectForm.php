<?php

namespace App\Filament\Resources\Projects\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Project details')->schema([
                    TextInput::make('slug')->required()->unique(ignoreRecord: true)->maxLength(255),
                    Grid::make(2)->schema([
                        TextInput::make('client_name')->maxLength(255),
                        TextInput::make('contract_value')->maxLength(255),
                        TextInput::make('project_period')->maxLength(255),
                        TextInput::make('status')->maxLength(255),
                        Toggle::make('is_featured')->default(false),
                        Toggle::make('is_published')->default(true),
                    ]),
                    FileUpload::make('image_path')
                        ->image()
                        ->disk('public')
                        ->directory('projects')
                        ->maxSize(5120),
                ]),
                Section::make('English content')->schema([
                    TextInput::make('title.en')->label('Title')->required()->maxLength(255),
                    RichEditor::make('description.en')->label('Description')->required(),
                ]),
                Section::make('Swahili content')->schema([
                    TextInput::make('title.sw')->label('Title')->maxLength(255),
                    RichEditor::make('description.sw')->label('Description'),
                ]),
            ]);
    }
}
