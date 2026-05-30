<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasLocalizedFields;

    protected $fillable = ['slug', 'title', 'excerpt', 'body', 'hero_image_path', 'is_published'];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'excerpt' => 'array',
            'body' => 'array',
            'is_published' => 'boolean',
        ];
    }
}
