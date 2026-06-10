<?php

namespace App\Console\Commands;

use App\Models\Document;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\NewsPost;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\StaffMember;
use App\Services\TranslationService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;

class TranslateAll extends Command
{
    protected $signature   = 'translate:all {--force : Re-translate even if Swahili already exists}';
    protected $description = 'Auto-translate all existing CMS records from English to Swahili';

    private array $models = [
        'Pages'       => [Page::class,       ['title', 'excerpt', 'body', 'meta_title', 'meta_description']],
        'Services'    => [Service::class,     ['title', 'summary', 'body']],
        'Projects'    => [Project::class,     ['title', 'description']],
        'News posts'  => [NewsPost::class,    ['title', 'excerpt', 'body']],
        'Events'      => [Event::class,       ['title', 'description']],
        'Staff'       => [StaffMember::class, ['position']],
        'Gallery'     => [GalleryItem::class, ['title', 'caption']],
        'Documents'   => [Document::class,    ['title', 'description']],
    ];

    public function handle(TranslationService $translator): int
    {
        $force = $this->option('force');

        foreach ($this->models as $label => [$modelClass, $fields]) {
            $records = $modelClass::all();
            $this->info("{$label}: {$records->count()} records");
            $bar = $this->output->createProgressBar($records->count());
            $bar->start();

            foreach ($records as $record) {
                $this->translateRecord($record, $fields, $translator, $force);
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
        }

        $this->info('Done.');

        return Command::SUCCESS;
    }

    private function translateRecord(Model $record, array $fields, TranslationService $translator, bool $force): void
    {
        $toTranslate = [];

        foreach ($fields as $field) {
            $value = $record->getAttribute($field);

            if (! is_array($value)) {
                continue;
            }

            $enValue = $value['en'] ?? '';
            $swValue = $value['sw'] ?? '';

            if (trim($enValue) === '') {
                continue;
            }

            if (! $force && trim($swValue) !== '') {
                continue;
            }

            $toTranslate[$field] = $enValue;
        }

        if (empty($toTranslate)) {
            return;
        }

        $translated = $translator->translateBatch($toTranslate);

        foreach ($translated as $field => $swText) {
            $value       = $record->getAttribute($field);
            $value['sw'] = $swText;
            $record->setAttribute($field, $value);
        }

        $record->saveQuietly();
    }
}
