<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration fixes existing master_guides records that have PLA or APLA roles.
     * These are not valid Master Guide investiture statuses, so we need to migrate them.
     *
     * PLA (Pathfinder Leader Assistant) and APLA (Advanced Pathfinder Leader Assistant)
     * are Pathfinder roles, not Master Guide roles. We'll convert them to MGT (Master Guide in Training)
     * as a safe default since they're likely in training.
     */
    public function up(): void
    {
        // Count how many records need fixing
        $plaCount = DB::table('master_guides')->where('role', 'PLA')->count();
        $aplaCount = DB::table('master_guides')->where('role', 'APLA')->count();

        if ($plaCount > 0 || $aplaCount > 0) {
            // Convert PLA to MGT (Master Guide in Training)
            DB::table('master_guides')
                ->where('role', 'PLA')
                ->update(['role' => 'MGT']);

            // Convert APLA to MGT (Master Guide in Training)
            DB::table('master_guides')
                ->where('role', 'APLA')
                ->update(['role' => 'MGT']);

            // Log the changes
            \Log::info("Master Guide role migration completed: {$plaCount} PLA → MGT, {$aplaCount} APLA → MGT");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot accurately reverse since we don't know which were originally PLA vs APLA
        // This is a one-way migration
    }
};
