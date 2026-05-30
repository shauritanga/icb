<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use Illuminate\Database\Eloquent\Model;

class GalleryItem extends Model
{
    use HasLocalizedFields;

    protected $fillable = ['title', 'caption', 'image_path', 'sort_order', 'is_published'];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'caption' => 'array',
            'is_published' => 'boolean',
        ];
    }
}
