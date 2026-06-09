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
        Schema::create('staff_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('master_guides')->onDelete('cascade');
            $table->string('credential_type'); // master_guide, instructor, counselor, director, club_secretary
            $table->string('status')->default('in_training'); // in_training, completed, certified
            $table->date('certified_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->foreignId('certified_by')->nullable()->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['staff_id', 'credential_type']);
            $table->index(['credential_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_credentials');
    }
};
