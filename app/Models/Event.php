<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasLocalizedFields;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'location',
        'event_date',
        'event_end_date',
        'registration_link',
        'image_path',
        'gallery_images',
        'is_published',
        'meta_title',
        'meta_description',
        'og_image_path',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'description' => 'array',
            'gallery_images' => 'array',
            'meta_title' => 'array',
            'meta_description' => 'array',
            'event_date' => 'datetime',
            'event_end_date' => 'datetime',
            'is_published' => 'boolean',
        ];
    }
}
