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
        Schema::table('master_guides', function (Blueprint $table) {
            $table->string('status')->default('active')->after('role'); // active, unassigned, inactive
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_guides', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
