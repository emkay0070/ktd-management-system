<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $roles = [
            ['name' => 'district_curriculum_coordinator', 'display_name' => 'District Curriculum Coordinator', 'description' => 'Manages Pathfinder curriculum across the district.'],
            ['name' => 'district_masterguide_coordinator', 'display_name' => 'District Master Guide Coordinator', 'description' => 'Manages Master Guide and leadership development across the district.'],
            ['name' => 'district_communication_coordinator', 'display_name' => 'District Communication Coordinator', 'description' => 'Manages district communications and bulletins.'],
            ['name' => 'district_programs_coordinator', 'display_name' => 'District Programs Coordinator', 'description' => 'Manages district events and missions.'],
            ['name' => 'district_music_coordinator', 'display_name' => 'District Music Coordinator', 'description' => 'Manages district music events.'],
            ['name' => 'district_welfare_coordinator', 'display_name' => 'District Welfare Coordinator', 'description' => 'Manages district welfare and appraisals.'],
            ['name' => 'district_pbe_coordinator', 'display_name' => 'District PBE Coordinator', 'description' => 'Manages Pathfinder Bible Experience for the district.'],
        ];

        foreach ($roles as $role) {
            $exists = DB::table('roles')->where('name', $role['name'])->exists();
            if (!$exists) {
                DB::table('roles')->insert($role + ['created_at' => now(), 'updated_at' => now()]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            //
        });
    }
};
