<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class DistrictDirectorController extends Controller
{
    public function storeDistrict(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'super_admin', 403);

        $request->validate([
            'name' => 'required|string|max:255',
            'conference_id' => 'required|exists:conferences,id',
            'zone_id' => 'nullable|exists:zones,id',
        ]);

        District::create($request->only(['name', 'conference_id', 'zone_id']));

        return back()->with('message', 'District created successfully.');
    }

    public function assignDirector(Request $request, District $district)
    {
        $currentUser = $request->user();
        abort_unless($currentUser && $currentUser->role === 'super_admin', 403);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $targetUser = User::findOrFail($request->user_id);
        
        // Remove from existing district if they had one
        if ($targetUser->district_id) {
            $targetUser->roles()->wherePivot('entity_type', District::class)->updateExistingPivot(
                Role::where('name', 'district_director')->first()->id, 
                ['status' => 'inactive']
            );
        }

        $targetUser->district_id = $district->id;
        $targetUser->save();

        $role = Role::firstOrCreate(['name' => 'district_director', 'display_name' => 'District Director']);
        
        $targetUser->roles()->syncWithoutDetaching([
            $role->id => [
                'status' => 'active',
                'assigned_by' => $currentUser->id,
                'entity_type' => District::class,
                'entity_id' => $district->id,
            ]
        ]);

        return back()->with('message', 'District Director assigned successfully.');
    }

    public function removeDirector(Request $request, User $user)
    {
        $currentUser = $request->user();
        abort_unless($currentUser && $currentUser->role === 'super_admin', 403);

        // Optional: clear the district_id and inactivate role
        $role = Role::where('name', 'district_director')->first();
        if ($role) {
            $user->roles()->updateExistingPivot($role->id, ['status' => 'inactive']);
        }
        
        $user->district_id = null;
        $user->save();

        return back()->with('message', 'District Director removed successfully.');
    }
    
    public function assignUnassignedDirector(Request $request, User $user)
    {
        $currentUser = $request->user();
        abort_unless($currentUser && $currentUser->role === 'super_admin', 403);

        $request->validate([
            'district_id' => 'required|exists:districts,id',
        ]);

        $district = District::findOrFail($request->district_id);
        
        $user->district_id = $district->id;
        $user->save();
        
        $role = Role::firstOrCreate(['name' => 'district_director', 'display_name' => 'District Director']);
        
        $user->roles()->updateExistingPivot($role->id, [
            'status' => 'active',
            'entity_type' => District::class,
            'entity_id' => $district->id,
            'assigned_by' => $currentUser->id,
        ]);

        return back()->with('message', 'District Director assigned to district successfully.');
    }
}
