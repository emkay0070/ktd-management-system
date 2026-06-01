<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_leader_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('master_guide_id')->constrained('master_guides')->cascadeOnDelete();
            $table->string('role'); // master_guide, counselor, instructor
            $table->timestamps();

            $table->unique(['class_id', 'master_guide_id', 'role'], 'class_leader_unique');
            $table->index(['class_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_leader_assignments');
    }
};

