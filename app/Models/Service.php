<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use App\Support\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasLocalizedFields;

    protected $fillable = [
        'title',
        'summary',
        'body',
        'icon',
        'image_path',
        'sort_order',
        'is_featured',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'summary' => 'array',
            'body' => 'array',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function setBodyAttribute($value): void
    {
        $this->attributes['body'] = json_encode($this->sanitizeLocalizedHtml($value));
    }

    private function sanitizeLocalizedHtml($value): array
    {
        return collect(is_array($value) ? $value : ['en' => $value])
            ->map(fn ($item) => is_string($item) ? HtmlSanitizer::richText($item) : '')
            ->all();
    }
}
