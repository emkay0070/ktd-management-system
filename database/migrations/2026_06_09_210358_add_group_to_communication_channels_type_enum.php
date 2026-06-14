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
        Schema::table('communication_channels', function (Blueprint $table) {
            $table->enum('type', ['direct', 'class', 'unit', 'club', 'district', 'union', 'public', 'group'])->default('club')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('communication_channels', function (Blueprint $table) {
            $table->enum('type', ['direct', 'class', 'unit', 'club', 'district', 'union', 'public'])->default('club')->change();
        });
    }
};
