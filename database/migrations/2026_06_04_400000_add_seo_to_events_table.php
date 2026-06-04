<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->json('meta_title')->nullable()->after('is_published');
            $table->json('meta_description')->nullable()->after('meta_title');
            $table->string('og_image_path')->nullable()->after('meta_description');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['meta_title', 'meta_description', 'og_image_path']);
        });
    }
};
