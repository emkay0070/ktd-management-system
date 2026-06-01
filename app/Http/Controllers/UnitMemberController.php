<?php

namespace App\Http\Controllers;

use App\Models\Pathfinder;
use App\Models\Unit;
use App\Models\UnitMember;
use App\Models\UnitRole;
use Illuminate\Http\Request;

class UnitMemberController extends Controller
{
    public function store(Request $request, Unit $unit)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id && $unit->church_id === $user->church_id, 403);

        $data = $request->validate([
            'pathfinder_id' => 'required|integer|exists:pathfinders,id',
        ]);

        $pathfinder = Pathfinder::query()
            ->where('id', $data['pathfinder_id'])
            ->where('church_id', $user->church_id)
            ->first();

        if (!$pathfinder) {
            return back()->withErrors(['pathfinder_id' => 'Invalid Pathfinder for this church.']);
        }

        $expected = $unit->gender === 'boys' ? 'Male' : 'Female';
        if ($pathfinder->gender !== $expected) {
            return back()->withErrors(['pathfinder_id' => 'Pathfinder gender does not match unit gender.']);
        }

        UnitMember::updateOrCreate(
            ['pathfinder_id' => $pathfinder->id],
            ['unit_id' => $unit->id],
        );

        return back()->with('message', 'Member added to unit.');
    }

    public function destroy(Request $request, Unit $unit, Pathfinder $pathfinder)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id && $unit->church_id === $user->church_id, 403);
        abort_unless($pathfinder->church_id === $user->church_id, 403);

        UnitMember::query()
            ->where('unit_id', $unit->id)
            ->where('pathfinder_id', $pathfinder->id)
            ->delete();

        $roles = UnitRole::query()->where('unit_id', $unit->id)->first();
        if ($roles) {
            $changed = false;
            if ($roles->captain_id === $pathfinder->id) {
                $roles->captain_id = null;
                $changed = true;
            }
            if ($roles->scribe_id === $pathfinder->id) {
                $roles->scribe_id = null;
                $changed = true;
            }
            if ($changed) {
                $roles->save();
            }
        }

        return back()->with('message', 'Member removed from unit.');
    }
}

