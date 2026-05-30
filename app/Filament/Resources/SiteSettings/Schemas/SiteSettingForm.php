<?php

namespace App\Filament\Resources\SiteSettings\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SiteSettingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Setting')->schema([
                    TextInput::make('key')->required()->unique(ignoreRecord: true)->maxLength(255),
                    Textarea::make('value.en')->label('Value EN')->rows(3),
                    Textarea::make('value.sw')->label('Value SW')->rows(3),
                ])->columns(2),
            ]);
    }
}
