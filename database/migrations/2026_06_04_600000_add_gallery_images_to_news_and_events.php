<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news_posts', function (Blueprint $table) {
            $table->json('gallery_images')->nullable()->after('image_path');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->json('gallery_images')->nullable()->after('image_path');
        });
    }

    public function down(): void
    {
        Schema::table('news_posts', function (Blueprint $table) {
            $table->dropColumn('gallery_images');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('gallery_images');
        });
    }
};
