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
        Schema::create('district_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->integer('points')->default(10);
            $table->date('deadline');
            $table->string('quarter')->nullable(); // e.g. Q1, Q2
            $table->integer('year')->nullable(); // e.g. 2026
            $table->string('status')->default('Active'); // Active, Closed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('district_tasks');
    }
};
