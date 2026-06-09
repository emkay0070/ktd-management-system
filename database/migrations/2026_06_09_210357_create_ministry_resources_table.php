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
        Schema::create('ministry_resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('category')->default('General'); // Honors, Manuals, Camping, Leadership
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->decimal('price', 8, 2)->default(0.00); // For marketplace concept
            $table->integer('downloads_count')->default(0);
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->enum('visibility', ['public', 'union', 'district', 'staff_only'])->default('union');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ministry_resources');
    }
};
