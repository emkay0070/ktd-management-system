<?php

use App\Models\StaffCredential;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration populates the staff_credentials table from existing master_guides data.
     * This is Phase 1 of the refactoring - creating a compatibility layer.
     */
    public function up(): void
    {
        // Get all master guides with their role information
        $masterGuides = DB::table('master_guides')->get();

        foreach ($masterGuides as $mg) {
            // Map existing role field to credentials
            // MG/MGT = Master Guide credential (invested)
            // Other roles might need instructor/counselor credentials based on context
            
            if (in_array($mg->role, ['MG', 'MGT'])) {
                // Create Master Guide credential for invested staff
                StaffCredential::firstOrCreate([
                    'staff_id' => $mg->id,
                    'credential_type' => 'master_guide',
                ], [
                    'status' => StaffCredential::STATUS_CERTIFIED,
                    'certified_at' => $mg->created_at, // Use creation date as proxy for certification date
                    'notes' => 'Migrated from master_guides.role field',
                ]);
            }

            // Note: We're not automatically creating instructor/counselor credentials
            // because the current system doesn't track CMT certifications separately.
            // These will need to be added manually or through a separate migration
            // once the CMT certification data is available.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove all credentials that were created by this migration
        DB::table('staff_credentials')
            ->where('notes', 'Migrated from master_guides.role field')
            ->delete();
    }
};
