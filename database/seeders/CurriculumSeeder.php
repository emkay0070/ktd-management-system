<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = \App\Models\PathfinderClass::all();

        if ($classes->isEmpty()) {
            return;
        }

        $categories = ['General', 'Spiritual Discovery', 'Serving Others', 'Health and Fitness', 'Nature Study', 'Campcraft and Honors'];

        foreach ($classes as $class) {
            foreach ($categories as $category) {
                // Generate 3 sample requirements for each category in each class
                for ($i = 1; $i <= 3; $i++) {
                    \App\Models\CurriculumRequirement::firstOrCreate([
                        'class_id' => $class->id,
                        'title' => "{$class->name} - {$category} Requirement {$i}",
                        'category' => $category,
                    ], [
                        'description' => "Complete the requirement $i for $category.",
                    ]);
                }
            }
        }
    }
}
