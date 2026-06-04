<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = \App\Models\User::with('roles', 'church')->get();
$mapped = $users->map(function($u) {
    return [
        'name' => $u->name,
        'email' => $u->email,
        'church' => $u->church ? $u->church->name : null,
        'church_district_id' => $u->church ? $u->church->district_id : null,
        'roles' => $u->roles->pluck('name')
    ];
});

echo json_encode(['users' => $mapped], JSON_PRETTY_PRINT);
