<?php

namespace App\Http\Controllers;

use App\Models\ClubOperation;
use App\Models\MasterGuide;
use Illuminate\Http\Request;

class ClubOperationsController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id, 403);

        $data = $request->validate([
            'weekly_meeting_frequency' => 'required|integer|min:0|max:14',
            'departments' => 'nullable|array',
            'departments.*.name' => 'required_with:departments|string|max:255',
            'departments.*.responsible_master_guide_id' => 'nullable|integer',
            'departments.*.notes' => 'nullable|string|max:5000',
        ]);

        $departments = $data['departments'] ?? [];
        foreach ($departments as $i => $dept) {
            if (!empty($dept['responsible_master_guide_id'])) {
                $mg = MasterGuide::query()
                    ->where('id', $dept['responsible_master_guide_id'])
                    ->where('church_id', $user->church_id)
                    ->first();
                if (!$mg) {
                    return back()->withErrors(["departments.$i.responsible_master_guide_id" => 'Invalid leader for this church.']);
                }
            }
        }

        ClubOperation::updateOrCreate(
            ['church_id' => $user->church_id],
            [
                'weekly_meeting_frequency' => (int) $data['weekly_meeting_frequency'],
                'departments' => $departments,
            ],
        );

        return back()->with('message', 'Club operations updated.');
    }
}

