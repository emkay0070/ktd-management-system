<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_guides', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('role')->default('MG'); // MG, MGiT
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->boolean('actively_teaching')->default(true);
            $table->text('responsibility')->nullable();
            $table->timestamps();

            $table->index(['church_id', 'role']);
            $table->index(['church_id', 'assigned_class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_guides');
    }
};

