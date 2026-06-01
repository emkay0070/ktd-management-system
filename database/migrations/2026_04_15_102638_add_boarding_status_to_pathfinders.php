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
        Schema::table('pathfinders', function (Blueprint $table) {
            $table->string('boarding_status')->default('day'); // 'day' or 'boarding'
        });
    }

    public function down(): void
    {
        Schema::table('pathfinders', function (Blueprint $table) {
            $table->dropColumn('boarding_status');
        });
    }
};
