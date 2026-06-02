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
        Schema::create('curriculum_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pathfinder_id')->constrained('pathfinders')->cascadeOnDelete();
            $table->foreignId('requirement_id')->constrained('curriculum_requirements')->cascadeOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete(); // The Master Guide who verified it
            $table->timestamps();

            // A pathfinder can only complete a specific requirement once
            $table->unique(['pathfinder_id', 'requirement_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum_progress');
    }
};
