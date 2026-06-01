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
        Schema::table('registrations', function (Blueprint $table) {
            $table->foreignId('district_event_id')->after('pathfinder_id')->nullable()->constrained('district_events')->cascadeOnDelete();
            $table->foreignId('church_id')->after('district_event_id')->nullable()->constrained()->cascadeOnDelete();
            $table->decimal('amount_paid', 12, 2)->default(0)->after('paid');
            $table->string('status')->default('pending')->after('amount_paid'); // pending, approved, cancelled
            $table->foreignId('verified_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            //
        });
    }
};
