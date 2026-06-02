<?php

namespace App\Filament\Resources\Documents\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class DocumentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Document')->schema([
                    Grid::make(2)->schema([
                        TextInput::make('title.en')->label('Title EN')->required()->maxLength(255),
                        TextInput::make('title.sw')->label('Title SW')->maxLength(255),
                        Textarea::make('description.en')->label('Description EN')->rows(2),
                        Textarea::make('description.sw')->label('Description SW')->rows(2),
                        TextInput::make('sort_order')->numeric()->default(0),
                        Toggle::make('is_published')->default(true),
                    ]),
                    FileUpload::make('file_path')
                        ->required()
                        ->disk('public')
                        ->directory('documents')
                        ->acceptedFileTypes([
                            'application/pdf',
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'application/vnd.ms-excel',
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        ])
                        ->maxSize(10240),
                ]),
            ]);
    }
}
