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
        Schema::create('honours', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('name');
            $blueprint->string('category')->index(); // Nature, Vocational, etc.
            $blueprint->integer('level')->default(1);
            $blueprint->text('description')->nullable();
            $blueprint->string('patch_path')->nullable();
            $blueprint->timestamps();
        });

        Schema::create('pathfinder_honour', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('pathfinder_id')->constrained()->onDelete('cascade');
            $blueprint->foreignId('honour_id')->constrained()->onDelete('cascade');
            $blueprint->string('status')->default('earned'); // earned, in_progress
            $blueprint->date('earned_at')->nullable();
            $blueprint->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pathfinder_honour');
        Schema::dropIfExists('honours');
    }
};
