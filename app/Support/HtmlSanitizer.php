<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;

class HtmlSanitizer
{
    /**
     * @var array<string, list<string>>
     */
    private const ALLOWED_TAGS = [
        'a' => ['href', 'title', 'target', 'rel'],
        'blockquote' => [],
        'br' => [],
        'em' => [],
        'h2' => [],
        'h3' => [],
        'h4' => [],
        'li' => [],
        'ol' => [],
        'p' => [],
        'strong' => [],
        'ul' => [],
    ];

    public static function richText(?string $html): string
    {
        if (! is_string($html) || trim($html) === '') {
            return '';
        }

        $wrapped = '<div>'.$html.'</div>';

        $document = new DOMDocument('1.0', 'UTF-8');

        libxml_use_internal_errors(true);
        $document->loadHTML(
            mb_convert_encoding($wrapped, 'HTML-ENTITIES', 'UTF-8'),
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
        libxml_clear_errors();

        $xpath = new DOMXPath($document);

        foreach ($xpath->query('//comment()') ?: [] as $comment) {
            $comment->parentNode?->removeChild($comment);
        }

        $root = $document->documentElement;

        if ($root instanceof DOMElement) {
            self::sanitizeNode($root);
        }

        return trim(self::innerHtml($root));
    }

    private static function sanitizeNode(DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if (! $child instanceof DOMElement) {
                continue;
            }

            $tag = strtolower($child->tagName);

            if (! array_key_exists($tag, self::ALLOWED_TAGS)) {
                self::unwrap($child);
                self::sanitizeNode($node);
                continue;
            }

            self::sanitizeAttributes($child, self::ALLOWED_TAGS[$tag]);
            self::sanitizeNode($child);
        }
    }

    /**
     * @param list<string> $allowedAttributes
     */
    private static function sanitizeAttributes(DOMElement $element, array $allowedAttributes): void
    {
        foreach (iterator_to_array($element->attributes) as $attribute) {
            $name = strtolower($attribute->nodeName);

            if (! in_array($name, $allowedAttributes, true)) {
                $element->removeAttribute($attribute->nodeName);
                continue;
            }

            if ($name === 'href') {
                $href = trim($attribute->nodeValue);

                if (! self::isSafeHref($href)) {
                    $element->removeAttribute('href');
                    continue;
                }
            }

            if ($name === 'target' && strtolower($attribute->nodeValue) === '_blank') {
                $element->setAttribute('rel', 'noopener noreferrer');
            }
        }
    }

    private static function isSafeHref(string $href): bool
    {
        if ($href === '' || str_starts_with($href, '#') || str_starts_with($href, '/')) {
            return true;
        }

        $scheme = parse_url($href, PHP_URL_SCHEME);

        return in_array(strtolower((string) $scheme), ['http', 'https', 'mailto', 'tel'], true);
    }

    private static function unwrap(DOMElement $element): void
    {
        $parent = $element->parentNode;

        if (! $parent) {
            return;
        }

        while ($element->firstChild) {
            $parent->insertBefore($element->firstChild, $element);
        }

        $parent->removeChild($element);
    }

    private static function innerHtml(?DOMNode $node): string
    {
        if (! $node) {
            return '';
        }

        $html = '';

        foreach ($node->childNodes as $child) {
            $html .= $node->ownerDocument?->saveHTML($child) ?? '';
        }

        return $html;
    }
}
