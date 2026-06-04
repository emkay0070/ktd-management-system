<?php

namespace App\Http\Controllers;

use App\Models\Church;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    /**
     * Approve a pending church registration.
     */
    public function approveChurch(Request $request, Church $church): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor->hasAnyRole(['super_admin', 'district_director']), 403);
        
        if (!$actor->hasRole('super_admin')) {
            abort_unless((int)$church->district_id === (int)$actor->district_id, 403);
        }

        $church->update(['status' => 'approved']);

        return back()->with('success', "Church \"{$church->name}\" has been approved.");
    }

    /**
     * Reject a pending church registration.
     */
    public function rejectChurch(Request $request, Church $church): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor->hasAnyRole(['super_admin', 'district_director']), 403);

        if (!$actor->hasRole('super_admin')) {
            abort_unless((int)$church->district_id === (int)$actor->district_id, 403);
        }

        $church->update(['status' => 'rejected']);

        return back()->with('success', "Church \"{$church->name}\" has been rejected.");
    }

    /**
     * Approve a pending leadership role for a user.
     * Activates the first pending role pivot found on the user.
     */
    public function approveRole(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor->hasAnyRole(['super_admin', 'district_director']), 403);

        if (!$actor->hasRole('super_admin')) {
            // Ensure the user being approved belongs to the same district as the actor
            $targetDistrictId = $user->district_id ?? $user->church?->district_id;
            
            abort_unless(
                $targetDistrictId && (int)$targetDistrictId === (int)$actor->district_id, 
                403, 
                "You do not have permission to approve users outside your district."
            );
        }

        $pendingRoles = $user->roles()->wherePivot('status', 'pending')->get();
        
        if ($pendingRoles->isEmpty()) {
            return back()->with('warning', "No pending roles found for this user.");
        }

        foreach ($pendingRoles as $role) {
            $user->roles()->updateExistingPivot($role->id, [
                'status' => 'active',
                'assigned_by' => $actor->id,
                'assigned_at' => now(),
            ]);
        }

        return back()->with('success', "Role approved for {$user->name}.");
    }

    /**
     * Reject (revoke) a pending leadership role for a user.
     */
    public function rejectRole(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor->hasAnyRole(['super_admin', 'district_director']), 403);

        if (!$actor->hasRole('super_admin')) {
            $targetDistrictId = $user->district_id ?? $user->church?->district_id;
            
            abort_unless(
                $targetDistrictId && (int)$targetDistrictId === (int)$actor->district_id, 
                403
            );
        }

        $pendingRole = $user->roles()->wherePivot('status', 'pending')->first();

        if ($pendingRole) {
            $user->roles()->updateExistingPivot($pendingRole->id, ['status' => 'revoked']);
        }

        return back()->with('success', "Role revoked for {$user->name}.");
    }
}

