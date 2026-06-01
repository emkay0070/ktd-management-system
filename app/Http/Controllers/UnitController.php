<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\UnitRole;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id, 403);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|string|in:boys,girls',
        ]);

        $unit = Unit::create([
            'name' => $data['name'],
            'gender' => $data['gender'],
            'church_id' => $user->church_id,
        ]);

        UnitRole::firstOrCreate(['unit_id' => $unit->id]);

        return back()->with('message', 'Unit created.');
    }

    public function update(Request $request, Unit $unit)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id && $unit->church_id === $user->church_id, 403);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|string|in:boys,girls',
        ]);

        if ($unit->gender !== $data['gender'] && $unit->members()->exists()) {
            return back()->withErrors(['gender' => 'Cannot change unit gender while it has members.']);
        }

        $unit->update($data);

        return back()->with('message', 'Unit updated.');
    }

    public function destroy(Request $request, Unit $unit)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id && $unit->church_id === $user->church_id, 403);

        $unit->delete();

        return back()->with('message', 'Unit removed.');
    }
}

