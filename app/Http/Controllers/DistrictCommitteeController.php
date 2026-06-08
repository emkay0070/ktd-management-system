<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DistrictCommitteeController extends Controller
{
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        if (!$user || !$user->isDistrictExecutive()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_name' => 'required|string|exists:roles,name'
        ]);

        $newMember = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'district_id' => $user->district_id,
        ]);

        // Assign role
        $role = \App\Models\Role::where('name', $validated['role_name'])->first();
        if ($role) {
            $newMember->roles()->attach($role->id, [
                'status' => 'active',
                'assigned_by' => $user->id,
                'assigned_at' => now(),
            ]);
        }

        return back()->with('message', 'District committee member assigned successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        /** @var \App\Models\User $authUser */
        $authUser = $request->user();
        abort_unless($authUser && $authUser->isDistrictExecutive(), 403, 'Unauthorized');
        abort_unless($user->district_id === $authUser->district_id, 403, 'Unauthorized');
        abort_if($user->id === $authUser->id, 400, 'Cannot remove yourself.');
        
        $user->delete();

        return back()->with('message', 'Committee member removed.');
    }
}
