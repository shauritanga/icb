<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use Illuminate\Database\Eloquent\Model;

class NewsPost extends Model
{
    use HasLocalizedFields;

    protected $fillable = [
        'slug',
        'title',
        'excerpt',
        'body',
        'image_path',
        'published_at',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'excerpt' => 'array',
            'body' => 'array',
            'published_at' => 'datetime',
            'is_published' => 'boolean',
        ];
    }
}
