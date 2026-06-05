<?php

namespace Database\Seeders;

use App\Models\Honour;
use Illuminate\Database\Seeder;

class HonourSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $honours = [
            ['name' => 'First Aid', 'category' => 'Health and Science', 'level' => 1, 'description' => 'Basic life-saving skills.'],
            ['name' => 'Camping Skills I', 'category' => 'Outdoor Industries', 'level' => 1, 'description' => 'Basic camping techniques.'],
            ['name' => 'Bible Marking', 'category' => 'Spiritual Growth', 'level' => 1, 'description' => 'Methods for marking and studying the Bible.'],
            ['name' => 'Christian Citizenship', 'category' => 'Spiritual Growth', 'level' => 1, 'description' => 'Understanding your role in the church and community.'],
            ['name' => 'Astronomy', 'category' => 'Nature Study', 'level' => 2, 'description' => 'Study of stars and planets.'],
            ['name' => 'Geology', 'category' => 'Nature Study', 'level' => 2, 'description' => 'Study of rocks and minerals.'],
            ['name' => 'Reptiles', 'category' => 'Nature Study', 'level' => 2, 'description' => 'Study of reptilian life.'],
            ['name' => 'Stewardship', 'category' => 'Spiritual Growth', 'level' => 1, 'description' => 'Managing God-given resources.'],
            ['name' => 'Knot Tying', 'category' => 'Outdoor Industries', 'level' => 1, 'description' => 'Basic knots for camping and utility.'],
        ];

        foreach ($honours as $honour) {
            Honour::firstOrCreate(['name' => $honour['name']], $honour);
        }
    }
}
