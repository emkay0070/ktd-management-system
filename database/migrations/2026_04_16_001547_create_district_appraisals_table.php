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
        Schema::create('district_appraisals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->string('quarter'); // Q1, Q2, Q3, Q4
            $table->integer('year');
            $table->integer('score_technical')->default(0); // Max 30
            $table->integer('score_admin')->default(0); // Max 30
            $table->integer('score_activities')->default(0); // Max 40
            $table->integer('total_score')->default(0); // Max 100
            $table->text('comments')->nullable();
            $table->timestamps();

            $table->unique(['church_id', 'quarter', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('district_appraisals');
    }
};
