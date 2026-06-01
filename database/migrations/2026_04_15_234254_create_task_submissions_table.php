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
        Schema::create('task_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_task_id')->constrained('district_tasks')->cascadeOnDelete();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->string('evidence_path')->nullable();
            $table->text('feedback')->nullable();
            $table->string('status')->default('Pending Review'); // Pending Review, Approved, Rejected
            $table->integer('points_awarded')->default(0);
            $table->timestamps();
            
            // A church can only submit once per task
            $table->unique(['district_task_id', 'church_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_submissions');
    }
};
