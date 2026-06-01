<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('gender'); // boys, girls
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['church_id', 'name']);
            $table->index(['church_id', 'gender']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};

