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
        // 1. Create Roles Table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'pathfinder', 'parent', 'director'
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Create Pivot Table
        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['active', 'pending', 'revoked'])->default('active');
            $table->foreignId('assigned_by')->nullable()->constrained('users');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'role_id']);
        });

        // 3. Seed Basic Roles
        $roles = [
            ['name' => 'super_admin', 'display_name' => 'System Admin'],
            ['name' => 'district_official', 'display_name' => 'District Official'],
            ['name' => 'director', 'display_name' => 'Club Director'],
            ['name' => 'master_guide', 'display_name' => 'Master Guide'],
            ['name' => 'pathfinder', 'display_name' => 'Pathfinder'],
            ['name' => 'parent', 'display_name' => 'Parent / Guardian'],
            ['name' => 'observer', 'display_name' => 'Observer / Guest'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insert($role + ['created_at' => now(), 'updated_at' => now()]);
        }

        // 4. Update Users Table with Status
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['pending_onboarding', 'active'])->default('active'); // active by default for existing users
        });

        // 5. Migrate Existing Data
        $users = DB::table('users')->select('id', 'role')->get();
        foreach ($users as $user) {
            if ($user->role) {
                $roleId = DB::table('roles')->where('name', $user->role)->value('id');
                if ($roleId) {
                    DB::table('role_user')->insert([
                        'user_id' => $user->id,
                        'role_id' => $roleId,
                        'status' => 'active',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 6. Final Clean: Remove the old role column (nullable first just in case)
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        // 7. Update Churches with Status
        Schema::table('churches', function (Blueprint $table) {
            $table->enum('status', ['pending_verification', 'approved', 'rejected'])->default('approved');
        });
    }

    public function down(): void
    {
        Schema::table('churches', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->nullable();
            $table->dropColumn('status');
        });

        // Re-migrating data back would be complex here, usually not done in destructive down()
        
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
    }
};
