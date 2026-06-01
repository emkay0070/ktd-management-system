<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DistrictCommitteeController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();
        abort_unless($user && $user->role === 'district_director', 403, 'Unauthorized');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'district_committee',
            'district_id' => $user->district_id,
        ]);

        return back()->with('message', 'District committee member assigned successfully.');
    }

    public function destroy(User $user)
    {
        $authUser = auth()->user();
        abort_unless($authUser && $authUser->role === 'district_director', 403, 'Unauthorized');
        abort_unless($user->district_id === $authUser->district_id, 403, 'Unauthorized');
        abort_if($user->id === $authUser->id, 400, 'Cannot remove yourself.');
        
        $user->delete();

        return back()->with('message', 'Committee member removed.');
    }
}
