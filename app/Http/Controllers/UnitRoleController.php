<?php

namespace App\Http\Controllers;

use App\Models\MasterGuide;
use App\Models\Unit;
use App\Models\UnitMember;
use App\Models\UnitRole;
use Illuminate\Http\Request;

class UnitRoleController extends Controller
{
    public function update(Request $request, Unit $unit)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id && $unit->church_id === $user->church_id, 403);

        $data = $request->validate([
            'captain_id' => 'nullable|integer|exists:pathfinders,id',
            'scribe_id' => 'nullable|integer|exists:pathfinders,id',
            'counselor_id' => 'nullable|integer|exists:master_guides,id',
        ]);

        $memberIds = UnitMember::query()
            ->where('unit_id', $unit->id)
            ->pluck('pathfinder_id')
            ->all();

        foreach (['captain_id', 'scribe_id'] as $key) {
            if (!empty($data[$key]) && !in_array((int) $data[$key], $memberIds, true)) {
                return back()->withErrors([$key => 'Selected Pathfinder must be a member of this unit.']);
            }
        }

        if (!empty($data['counselor_id'])) {
            $mg = MasterGuide::query()
                ->where('id', $data['counselor_id'])
                ->where('church_id', $user->church_id)
                ->first();
            if (!$mg) {
                return back()->withErrors(['counselor_id' => 'Invalid leader for this church.']);
            }
        }

        UnitRole::updateOrCreate(
            ['unit_id' => $unit->id],
            [
                'captain_id' => $data['captain_id'] ?? null,
                'scribe_id' => $data['scribe_id'] ?? null,
                'counselor_id' => $data['counselor_id'] ?? null,
            ],
        );

        return back()->with('message', 'Unit roles updated.');
    }
}

