<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }

    public static function value(string $key, ?string $locale = null, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();
        $value = $setting?->value;

        if (is_array($value) && $locale) {
            return $value[$locale] ?? $value['en'] ?? $default;
        }

        return $value ?? $default;
    }
}
