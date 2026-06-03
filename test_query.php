<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $unassigned_directors = \App\Models\User::whereHas('roles', function($q) {
        $q->where('name', 'district_director')->wherePivot('status', 'active');
    })->whereNull('district_id')->get()->map->only(['id', 'name', 'email']);
    
    echo "Success: " . count($unassigned_directors) . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
