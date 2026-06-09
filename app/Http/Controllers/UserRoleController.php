<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Church;
use App\Models\District;
use App\Models\MasterGuide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserRoleController extends Controller
{
    /**
     * Assign a new role to an existing user.
     */
    public function assign(Request $request, User $user)
    {
        $request->validate([
            'role_name' => 'required|string|exists:roles,name',
            'church_id' => 'required_if:role_name,director|nullable|exists:churches,id',
            'district_id' => 'required_if:role_name,district_director|nullable|exists:districts,id',
        ]);

        $role = Role::where('name', $request->role_name)->firstOrFail();
        
        $pivotData = [
            'status' => 'active',
            'assigned_by' => Auth::id(),
            'assigned_at' => now(),
        ];

        if ($request->role_name === 'director' && $request->church_id) {
            $pivotData['entity_type'] = Church::class;
            $pivotData['entity_id'] = $request->church_id;
            
            // Also update user's church_id if not set
            if (!$user->church_id) {
                $user->update(['church_id' => $request->church_id]);
            }
        } elseif (str_starts_with($request->role_name, 'district_') && $request->district_id) {
            $pivotData['entity_type'] = District::class;
            $pivotData['entity_id'] = $request->district_id;
            
            // Also update user's district_id if not set
            if (!$user->district_id) {
                $user->update(['district_id' => $request->district_id]);
            }
        }

        // Attach the role (avoid duplicates)
        $user->roles()->syncWithoutDetaching([
            $role->id => $pivotData
        ]);

        // Special handling for Master Guide role: Ensure a profile exists
        if ($request->role_name === 'master_guide') {
            MasterGuide::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $user->name,
                    'role' => 'MG',
                    'status' => 'active',
                    'investiture_status' => 'certified',
                    'church_id' => $user->church_id,
                    'onboarding_source' => 'role_assignment',
                    'residence' => 'N/A',
                    'occupation_status' => 'working',
                    'insured_yearly' => true,
                    'actively_teaching' => false,
                ]
            );
        }

        // Sync to communication channels
        app(\App\Services\CommunicationService::class)->syncUserToChannels($user);

        return back()->with('message', "Role '{$role->display_name}' assigned to {$user->name}.");
    }
}
