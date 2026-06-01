<?php

namespace App\Http\Controllers;

use App\Models\Church;
use App\Services\ClubCommandCenterService;
use Inertia\Inertia;

class ClubViewerController extends Controller
{
    public function show(Church $church, ClubCommandCenterService $clubService)
    {
        $user = auth()->user();

        $canView = $user->role === 'super_admin' || 
                  (in_array($user->role, ['district_director', 'district_committee']) && $user->district_id === $church->district_id);

        abort_unless($canView, 403, 'Unauthorized. You do not have oversight for this club.');

        return Inertia::render('Dashboard/Director', [
            'club' => $clubService->buildForChurch($church),
            'readonly' => true,
        ]);
    }
}

