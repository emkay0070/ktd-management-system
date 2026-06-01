<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Conference;
use App\Models\District;
use App\Models\Church;
use App\Models\User;

class HierarchySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $conference = Conference::firstOrCreate(['name' => 'Central Uganda Conference']);

        $district = District::firstOrCreate([
            'name' => 'Kireka Town District',
            'conference_id' => $conference->id,
        ]);

        // Link all unlinked churches to this district to avoid breaking current structure
        Church::whereNull('district_id')->update(['district_id' => $district->id]);

        // Create a dummy district director if one doesnt exist
        if (!User::where('email', 'director@kireka.district')->exists()) {
            User::create([
                'name' => 'KTD Director',
                'email' => 'director@kireka.district',
                'password' => bcrypt('password'),
                'role' => 'district_director',
                'district_id' => $district->id,
            ]);
        }
    }
}
