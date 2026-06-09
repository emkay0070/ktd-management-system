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
        Schema::create('communication_channels', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->enum('type', ['direct', 'class', 'unit', 'club', 'district', 'union', 'public'])->default('club');
            
            // Morph relation to link to Church, Class, Unit, etc.
            $table->nullableMorphs('model');
            
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('communication_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('channel_id')->constrained('communication_channels')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('last_read_at')->nullable();
            $table->boolean('is_muted')->default(false);
            $table->enum('role', ['member', 'admin', 'moderator'])->default('member');
            $table->timestamps();

            $table->unique(['channel_id', 'user_id']);
        });

        Schema::create('communication_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('channel_id')->constrained('communication_channels')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('content')->nullable();
            $table->enum('type', ['text', 'image', 'audio', 'video', 'document', 'system'])->default('text');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['channel_id', 'created_at']);
        });

        Schema::create('communication_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('communication_messages')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('communication_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('communication_messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('emoji');
            $table->timestamps();

            $table->unique(['message_id', 'user_id', 'emoji']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_reactions');
        Schema::dropIfExists('communication_attachments');
        Schema::dropIfExists('communication_messages');
        Schema::dropIfExists('communication_participants');
        Schema::dropIfExists('communication_channels');
    }
};
