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
            ['name' => 'district_director', 'display_name' => 'District Director', 'description' => 'Oversees the entire district.'],
            ['name' => 'district_treasurer', 'display_name' => 'District Treasurer', 'description' => 'Manages district finances.'],
            ['name' => 'district_secretary', 'display_name' => 'District Secretary', 'description' => 'Manages district records and communications.'],
            ['name' => 'district_committee', 'display_name' => 'District Committee Member', 'description' => 'General district committee member.'],
        ];

        foreach ($roles as $role) {
            // Check if it already exists to be safe
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
        DB::table('roles')->whereIn('name', [
            'district_director',
            'district_treasurer',
            'district_secretary',
            'district_committee'
        ])->delete();
    }
};
