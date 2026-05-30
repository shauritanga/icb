<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasLocalizedFields;

    protected $fillable = ['title', 'description', 'file_path', 'sort_order', 'is_published'];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'description' => 'array',
            'is_published' => 'boolean',
        ];
    }
}
