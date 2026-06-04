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
        // 1. District Events
        Schema::table('district_events', function (Blueprint $table) {
            $table->dropColumn('is_published');
            $table->renameColumn('status', 'operational_status');
        });
        
        Schema::table('district_events', function (Blueprint $table) {
            $table->string('workflow_status')->default('draft');
            $table->string('message_type')->default('official_event');
        });

        // 2. District Tasks (Missions)
        Schema::table('district_tasks', function (Blueprint $table) {
            $table->renameColumn('status', 'workflow_status');
        });
        
        Schema::table('district_tasks', function (Blueprint $table) {
            $table->string('message_type')->default('official_directive');
        });

        // 3. District Bulletins
        Schema::table('district_bulletins', function (Blueprint $table) {
            $table->dropColumn('is_active');
            $table->string('workflow_status')->default('draft');
            $table->string('message_type')->default('bulletin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('district_events', function (Blueprint $table) {
            $table->boolean('is_published')->default(false);
            $table->renameColumn('operational_status', 'status');
            $table->dropColumn(['workflow_status', 'message_type']);
        });

        Schema::table('district_tasks', function (Blueprint $table) {
            $table->renameColumn('workflow_status', 'status');
            $table->dropColumn('message_type');
        });

        Schema::table('district_bulletins', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
            $table->dropColumn(['workflow_status', 'message_type']);
        });
    }
};
