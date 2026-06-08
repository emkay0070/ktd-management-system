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
        Schema::create('curriculum_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->foreignId('audited_by')->constrained('users')->cascadeOnDelete();
            $table->date('audit_date');
            $table->integer('teaching_quality_score')->default(0); // 1-10
            $table->integer('record_keeping_score')->default(0); // 1-10
            $table->integer('facilities_score')->default(0); // 1-10
            $table->text('comments')->nullable();
            $table->text('recommendations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum_audits');
    }
};
