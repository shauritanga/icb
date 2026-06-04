<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use App\Support\HtmlSanitizer;
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
        'gallery_images',
        'is_featured',
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
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function setDescriptionAttribute($value): void
    {
        $this->attributes['description'] = json_encode($this->sanitizeLocalizedHtml($value));
    }

    private function sanitizeLocalizedHtml($value): array
    {
        return collect(is_array($value) ? $value : ['en' => $value])
            ->map(fn ($item) => is_string($item) ? HtmlSanitizer::richText($item) : '')
            ->all();
    }
}
