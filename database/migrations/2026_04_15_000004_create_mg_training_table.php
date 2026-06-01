<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mg_training', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_guide_id')->constrained('master_guides')->cascadeOnDelete();
            $table->date('training_start_date');
            $table->date('expected_completion_date')->nullable();
            $table->string('status')->default('ongoing'); // ongoing, completed, paused
            $table->foreignId('assigned_mentor_id')->nullable()->constrained('master_guides')->nullOnDelete();
            $table->timestamps();

            $table->index(['master_guide_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mg_training');
    }
};

