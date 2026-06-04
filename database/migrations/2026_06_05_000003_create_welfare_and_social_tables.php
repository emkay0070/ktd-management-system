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
        Schema::create('welfare_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->foreignId('church_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Beneficiary
            $table->string('beneficiary_name')->nullable(); // For cases where user is not registered
            $table->string('category'); // Illness, Bereavement, Financial, Emergency, etc.
            $table->text('description');
            $table->string('status')->default('open'); // open, review, assisted, closed
            $table->text('support_provided')->nullable();
            $table->text('follow_up_notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('social_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('event_date');
            $table->string('category'); // Fellowship, Sports, Retreat, Team Building, etc.
            $table->string('status')->default('planned'); // planned, ongoing, completed, cancelled
            $table->decimal('budget', 12, 2)->default(0);
            $table->integer('attendance_count')->default(0);
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_events');
        Schema::dropIfExists('welfare_cases');
    }
};
