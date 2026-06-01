<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignId('captain_id')->nullable()->constrained('pathfinders')->nullOnDelete();
            $table->foreignId('scribe_id')->nullable()->constrained('pathfinders')->nullOnDelete();
            $table->foreignId('counselor_id')->nullable()->constrained('master_guides')->nullOnDelete();
            $table->timestamps();

            $table->unique('unit_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_roles');
    }
};

