<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_members', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('name');
        });

        // Seed slugs for existing records — derive from the last word of the name
        DB::table('staff_members')->get()->each(function ($row) {
            $parts = preg_split('/\s+/', trim($row->name));
            $slug = Str::slug(end($parts));
            DB::table('staff_members')->where('id', $row->id)->update(['slug' => $slug]);
        });
    }

    public function down(): void
    {
        Schema::table('staff_members', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
