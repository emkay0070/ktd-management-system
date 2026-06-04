<?php

namespace Database\Seeders;

use App\Models\Church;
use App\Models\PathfinderClass;
use App\Models\Religion;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Restore Organizational Hierarchy (Unions, Conferences, Zones, Districts, Churches)
        $this->call(CentralUgandaConferenceSeeder::class);
        // User::factory(10)->create();

        $classes = [
            'Friend',
            'Companion',
            'Explorer',
            'Ranger',
            'Voyager',
            'Guide',
        ];

        foreach ($classes as $className) {
            PathfinderClass::firstOrCreate(['name' => $className]);
        }

        $religions = [
            'SDA',
            'Catholic',
            'Anglican',
            'Pentecostal',
            'Muslim',
            'Orthodox',
            'Other',
        ];

        foreach ($religions as $religionName) {
            Religion::firstOrCreate(['name' => $religionName]);
        }

        // Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@empfc.org'],
            [
                'name' => 'System Admin',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
        );
        $superAdminRole = \App\Models\Role::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            $admin->roles()->sync([$superAdminRole->id => ['status' => 'active']]);
        }
    }
}
