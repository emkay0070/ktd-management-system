<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignId('pathfinder_id')->constrained('pathfinders')->cascadeOnDelete();
            $table->timestamps();

            $table->unique('pathfinder_id');
            $table->index(['unit_id', 'pathfinder_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_members');
    }
};

