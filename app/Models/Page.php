<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use App\Support\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasLocalizedFields;

    protected $fillable = ['slug', 'title', 'excerpt', 'body', 'hero_image_path', 'is_published', 'meta_title', 'meta_description', 'og_image_path'];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'excerpt' => 'array',
            'body' => 'array',
            'meta_title' => 'array',
            'meta_description' => 'array',
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
