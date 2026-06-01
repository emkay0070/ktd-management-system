<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('club_operations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('weekly_meeting_frequency')->default(1);
            $table->json('departments')->nullable(); // [{name, responsible_master_guide_id, notes}]
            $table->timestamps();

            $table->unique('church_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('club_operations');
    }
};

