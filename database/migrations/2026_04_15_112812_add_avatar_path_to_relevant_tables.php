<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('church_id');
        });

        Schema::table('pathfinders', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('name');
        });

        Schema::table('master_guides', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('full_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar_path');
        });

        Schema::table('pathfinders', function (Blueprint $table) {
            $table->dropColumn('avatar_path');
        });

        Schema::table('master_guides', function (Blueprint $table) {
            $table->dropColumn('avatar_path');
        });
    }
};
