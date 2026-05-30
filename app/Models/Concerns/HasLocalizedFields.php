<?php

namespace App\Models\Concerns;

trait HasLocalizedFields
{
    public function localized(string $field, ?string $locale = null): string
    {
        $locale ??= app()->getLocale();
        $value = $this->getAttribute($field);

        if (is_array($value)) {
            return $value[$locale] ?? $value['en'] ?? reset($value) ?: '';
        }

        return (string) ($value ?? '');
    }
}
