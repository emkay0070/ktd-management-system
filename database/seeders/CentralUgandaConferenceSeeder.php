<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Union;
use App\Models\Conference;
use App\Models\Zone;
use App\Models\District;
use App\Models\Church;

class CentralUgandaConferenceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or Create the Union
        $union = Union::firstOrCreate(['name' => 'Uganda Union Mission']);

        // Get or Create Central Uganda Conference
        $cuc = Conference::firstOrCreate([
            'name' => 'Central Uganda Conference',
            'union_id' => $union->id
        ]);

        // ── East Kampala Zone (EKZ) ─────────────────────────────────────
        $ekz = Zone::firstOrCreate([
            'name' => 'East Kampala Zone',
            'conference_id' => $cuc->id
        ]);

        // Remove old "Kireka District" if it exists (split into KHD & KTD)
        District::where('name', 'Kireka District')->where('zone_id', $ekz->id)->delete();
        // Remove Ntinda (belongs to Luzira District)
        District::where('name', 'Ntinda District')->where('zone_id', $ekz->id)->delete();
        // Remove old Mbalwa District (Mbalwa is a church under KTD, not a district)
        District::where('name', 'Mbalwa District')->where('zone_id', $ekz->id)->delete();

        // Updated EKZ Districts
        $ekzDistricts = [
            'Kireka Hill District',    // KHD — split from old Kireka
            'Kireka Town District',    // KTD — split from old Kireka
            'Bweyogerere District',
            'Luzira District',         // Ntinda now belongs here
            'Mutungo District',
            'Seeta District',
            'Mukono District',
            'Kyanja District',
            'Kisasi District',
        ];

        foreach ($ekzDistricts as $districtName) {
            District::firstOrCreate([
                'name' => $districtName,
                'zone_id' => $ekz->id,
                'conference_id' => $cuc->id
            ]);
        }

        // ── Seed KTD (Kireka Town District) Churches ────────────────────
        $ktd = District::where('name', 'Kireka Town District')->where('zone_id', $ekz->id)->first();

        $ktdChurches = [
            ['name' => 'SDA Church Kireka Town',  'location' => 'Kireka Town, Wakiso'],
            ['name' => 'SDA Church Mbalwa',       'location' => 'Mbalwa, Kira Municipality'],
            ['name' => 'SDA Church Namugongo',     'location' => 'Namugongo, Wakiso'],
            ['name' => 'SDA Church Kira',          'location' => 'Kira Town, Wakiso'],
            ['name' => 'SDA Church Kiwologoma',    'location' => 'Kiwologoma, Kira'],
            ['name' => 'SDA Church Nsasa',         'location' => 'Nsasa, Kira'],
            ['name' => 'SDA Church Naalya',        'location' => 'Naalya, Kira Municipality'],
            ['name' => 'SDA Church Kito',          'location' => 'Kito, Wakiso'],
        ];

        if ($ktd) {
            foreach ($ktdChurches as $churchData) {
                Church::firstOrCreate(
                    ['name' => $churchData['name'], 'district_id' => $ktd->id],
                    ['location' => $churchData['location'], 'status' => 'approved']
                );
            }
        }

        // ── West Kampala Zone (WKZ) ─────────────────────────────────────
        $wkz = Zone::firstOrCreate([
            'name' => 'West Kampala Zone',
            'conference_id' => $cuc->id
        ]);
        
        $wkzDistricts = [
            'Busega District',
            'Nansana District',
            'Wakiso District',
            'Maganjo District',
            'Kawempe District'
        ];
        
        foreach ($wkzDistricts as $districtName) {
            District::firstOrCreate([
                'name' => $districtName,
                'zone_id' => $wkz->id,
                'conference_id' => $cuc->id
            ]);
        }
    }
}
