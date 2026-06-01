<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('committee_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('committee_id')->constrained('committees')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('pathfinder_id')->nullable()->constrained('pathfinders')->nullOnDelete();
            $table->foreignId('master_guide_id')->nullable()->constrained('master_guides')->nullOnDelete();
            $table->string('role');
            $table->timestamps();

            $table->index(['committee_id', 'role']);
            $table->index(['committee_id', 'user_id']);
            $table->index(['committee_id', 'pathfinder_id']);
            $table->index(['committee_id', 'master_guide_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('committee_members');
    }
};

