<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Union;

class UgandaUnionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $union = Union::firstOrCreate(['name' => 'Uganda Union Mission']);

        $conferences = [
            'Central Uganda Conference',
            'Busoga Field',
            'East Buganda Field',
            'Mid-Eastern Uganda Field',
            'Mid-Western Uganda Field',
            'Mount Elgon Field',
            'North Buganda Field',
            'Northern Uganda Field',
            'Rwenzori Field',
            'Southwestern Uganda Field',
            'West Buganda Field',
            'Western Uganda Field',
        ];

        foreach ($conferences as $confName) {
            $union->conferences()->firstOrCreate(['name' => $confName]);
        }
    }
}
