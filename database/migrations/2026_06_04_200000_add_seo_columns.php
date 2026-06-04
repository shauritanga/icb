<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['pages', 'news_posts', 'services', 'projects'] as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->json('meta_title')->nullable()->after('is_published');
                $blueprint->json('meta_description')->nullable()->after('meta_title');
                $blueprint->string('og_image_path')->nullable()->after('meta_description');
            });
        }
    }

    public function down(): void
    {
        foreach (['pages', 'news_posts', 'services', 'projects'] as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropColumn(['meta_title', 'meta_description', 'og_image_path']);
            });
        }
    }
};
