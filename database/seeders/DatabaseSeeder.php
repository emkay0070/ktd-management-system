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

        $church = Church::firstOrCreate([
            'name' => 'Kampala Central SDA',
        ], [
            'location' => 'Kampala',
        ]);

        // Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@empfc.org'],
            [
                'name' => 'District Admin',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
        );
        $superAdminRole = \App\Models\Role::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            $admin->roles()->sync([$superAdminRole->id => ['status' => 'active']]);
        }

        // Church Director
        $director = User::firstOrCreate(
            ['email' => 'director@empfc.org'],
            [
                'name' => 'Church Director',
                'password' => bcrypt('password'),
                'church_id' => $church->id,
                'email_verified_at' => now(),
            ],
        );
        $directorRole = \App\Models\Role::where('name', 'director')->first();
        if ($directorRole) {
            $director->roles()->sync([$directorRole->id => ['status' => 'active']]);
        }
    }
}
