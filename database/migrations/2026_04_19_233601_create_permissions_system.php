<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Permissions table
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->string('group')->default('general');
            $table->timestamps();
        });

        // 2. Role → Permission pivot
        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->primary(['permission_id', 'role_id']);
        });

        // 3. Seed Permissions
        $now = now();
        $permissions = [
            ['name' => 'create_church',         'display_name' => 'Create a Church',           'group' => 'church'],
            ['name' => 'approve_church',        'display_name' => 'Approve Church Application', 'group' => 'church'],
            ['name' => 'edit_church',           'display_name' => 'Edit Church Details',        'group' => 'church'],
            ['name' => 'view_all_churches',     'display_name' => 'View All Churches',          'group' => 'church'],
            ['name' => 'register_pathfinder',   'display_name' => 'Register a Pathfinder',      'group' => 'members'],
            ['name' => 'edit_pathfinder',       'display_name' => 'Edit Pathfinder Profile',    'group' => 'members'],
            ['name' => 'view_pathfinder',       'display_name' => 'View Pathfinder Profiles',   'group' => 'members'],
            ['name' => 'view_medical_flags',    'display_name' => 'View Medical Flags',         'group' => 'members'],
            ['name' => 'link_parent_child',     'display_name' => 'Link Parent to Child',       'group' => 'linking'],
            ['name' => 'approve_parent_link',   'display_name' => 'Approve Parent Link',        'group' => 'linking'],
            ['name' => 'view_child_data',       'display_name' => 'View Own Child Data',        'group' => 'linking'],
            ['name' => 'approve_director',      'display_name' => 'Approve Club Director',      'group' => 'roles'],
            ['name' => 'approve_master_guide',  'display_name' => 'Approve Master Guide',       'group' => 'roles'],
            ['name' => 'assign_role',           'display_name' => 'Assign Any Role',            'group' => 'roles'],
            ['name' => 'manage_district_events','display_name' => 'Manage District Events',     'group' => 'district'],
            ['name' => 'manage_bulletins',      'display_name' => 'Manage Bulletins',           'group' => 'district'],
            ['name' => 'view_district_pulse',   'display_name' => 'View District Analytics',    'group' => 'district'],
            ['name' => 'manage_appraisals',     'display_name' => 'Manage Club Appraisals',     'group' => 'district'],
            ['name' => 'view_treasury',         'display_name' => 'View Treasury Reports',      'group' => 'district'],
            ['name' => 'manage_club_settings',  'display_name' => 'Manage Club Settings',       'group' => 'club'],
            ['name' => 'manage_units',          'display_name' => 'Manage Units',               'group' => 'club'],
            ['name' => 'manage_attendance',     'display_name' => 'Manage Attendance',          'group' => 'club'],
            ['name' => 'manage_master_guides',  'display_name' => 'Manage Master Guides',       'group' => 'club'],
            ['name' => 'view_audit_log',        'display_name' => 'View Audit Log',             'group' => 'system'],
            ['name' => 'impersonate_user',      'display_name' => 'Impersonate Any User',       'group' => 'system'],
        ];

        foreach ($permissions as &$p) {
            $p['created_at'] = $now;
            $p['updated_at'] = $now;
        }
        DB::table('permissions')->insert($permissions);

        // 4. Assign permissions to roles
        $map = [
            'super_admin' => [
                'create_church','approve_church','edit_church','view_all_churches',
                'register_pathfinder','edit_pathfinder','view_pathfinder','view_medical_flags',
                'link_parent_child','approve_parent_link',
                'approve_director','approve_master_guide','assign_role',
                'manage_district_events','manage_bulletins','view_district_pulse','manage_appraisals','view_treasury',
                'manage_club_settings','manage_units','manage_attendance','manage_master_guides',
                'view_audit_log','impersonate_user',
            ],
            'district_official' => [
                'approve_church','view_all_churches',
                'view_pathfinder','view_medical_flags',
                'approve_parent_link',
                'approve_director','approve_master_guide','assign_role',
                'manage_district_events','manage_bulletins','view_district_pulse','manage_appraisals','view_treasury',
                'view_audit_log',
            ],
            'director' => [
                'register_pathfinder','edit_pathfinder','view_pathfinder','view_medical_flags',
                'link_parent_child','approve_parent_link',
                'approve_master_guide',
                'manage_bulletins',
                'manage_club_settings','manage_units','manage_attendance','manage_master_guides',
            ],
            'master_guide' => [
                'view_pathfinder','manage_units','manage_attendance',
            ],
            'parent' => [
                'view_child_data',
            ],
            'pathfinder' => [],
            'observer'   => [],
        ];

        foreach ($map as $roleName => $permNames) {
            $roleId = DB::table('roles')->where('name', $roleName)->value('id');
            if (!$roleId || empty($permNames)) continue;
            foreach ($permNames as $permName) {
                $permId = DB::table('permissions')->where('name', $permName)->value('id');
                if ($permId) {
                    DB::table('permission_role')->insert([
                        'permission_id' => $permId,
                        'role_id'       => $roleId,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
    }
};
