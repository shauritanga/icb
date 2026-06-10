<?php

namespace App\Services;

use Stichoza\GoogleTranslate\GoogleTranslate;
use Throwable;

class TranslationService
{
    private GoogleTranslate $translator;

    public function __construct()
    {
        $this->translator = new GoogleTranslate('sw', 'en');
    }

    public function translate(string $text): string
    {
        if (trim($text) === '') {
            return '';
        }

        try {
            return $this->translator->translate($text) ?? $text;
        } catch (Throwable) {
            return $text;
        }
    }

    /**
     * Translate multiple strings in one pass. Returns array with same keys.
     *
     * @param  array<string, string>  $texts
     * @return array<string, string>
     */
    public function translateBatch(array $texts): array
    {
        $results = [];

        foreach ($texts as $key => $text) {
            $results[$key] = $this->translate((string) $text);
        }

        return $results;
    }
}
