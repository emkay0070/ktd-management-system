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
        Schema::table('master_guides', function (Blueprint $table) {
            $table->string('investiture_status')->nullable()->after('status'); // in_training, certified, unknown, not_applicable
            $table->string('master_guide_level')->nullable()->after('investiture_status'); // MGT, MG, MG+, Instructor-Certified MG
            $table->date('training_started_at')->nullable()->after('master_guide_level');
            $table->date('training_completed_at')->nullable()->after('training_started_at');
            $table->date('investiture_date')->nullable()->after('training_completed_at');
            $table->string('onboarding_source')->default('manual_admin')->after('investiture_date'); // manual_admin, self_registration, migration, bulk_import
            $table->boolean('is_active_in_club')->default(true)->after('onboarding_source');
            $table->boolean('can_serve_as_staff')->default(true)->after('is_active_in_club');
        });

        // Populate legacy data
        \Illuminate\Support\Facades\DB::table('master_guides')->get()->each(function ($mg) {
            $status = 'unknown';
            if ($mg->role === 'MG') $status = 'certified';
            if ($mg->role === 'MGT') $status = 'in_training';

            \Illuminate\Support\Facades\DB::table('master_guides')
                ->where('id', $mg->id)
                ->update([
                    'investiture_status' => $status,
                    'master_guide_level' => $mg->role,
                    'onboarding_source' => 'migration'
                ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_guides', function (Blueprint $table) {
            $table->dropColumn([
                'investiture_status',
                'master_guide_level',
                'training_started_at',
                'training_completed_at',
                'investiture_date',
                'onboarding_source',
                'is_active_in_club',
                'can_serve_as_staff',
            ]);
        });
    }
};
