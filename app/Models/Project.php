<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasLocalizedFields;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'client_name',
        'contract_value',
        'project_period',
        'status',
        'image_path',
        'is_featured',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'description' => 'array',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }
}
