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
        $user = $request->user();
        abort_unless($user->hasAnyRole(['super_admin', 'district_director']), 403);
        
        if (!$user->hasRole('super_admin')) {
            abort_unless($church->district_id === $user->district_id, 403);
        }

        $church->update(['status' => 'approved']);

        return back()->with('success', "Church \"{$church->name}\" has been approved.");
    }

    /**
     * Reject a pending church registration.
     */
    public function rejectChurch(Request $request, Church $church): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['super_admin', 'district_director']), 403);

        if (!$user->hasRole('super_admin')) {
            abort_unless($church->district_id === $user->district_id, 403);
        }

        $church->update(['status' => 'rejected']);

        return back()->with('success', "Church \"{$church->name}\" has been rejected.");
    }

    /**
     * Approve a pending leadership role for a user.
     * Activates the first pending role pivot found on the user.
     */
    public function approveRole(Request $request, User $userTarget): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['super_admin', 'district_director']), 403);

        if (!$user->hasRole('super_admin')) {
            abort_unless($userTarget->district_id === $user->district_id || $userTarget->church?->district_id === $user->district_id, 403);
        }

        $pendingRole = $userTarget->roles()->wherePivot('status', 'pending')->first();

        if ($pendingRole) {
            $userTarget->roles()->updateExistingPivot($pendingRole->id, ['status' => 'active']);
        }

        return back()->with('success', "Role approved for {$userTarget->name}.");
    }

    /**
     * Reject (revoke) a pending leadership role for a user.
     */
    public function rejectRole(Request $request, User $userTarget): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['super_admin', 'district_director']), 403);

        if (!$user->hasRole('super_admin')) {
            abort_unless($userTarget->district_id === $user->district_id || $userTarget->church?->district_id === $user->district_id, 403);
        }

        $pendingRole = $userTarget->roles()->wherePivot('status', 'pending')->first();

        if ($pendingRole) {
            $userTarget->roles()->updateExistingPivot($pendingRole->id, ['status' => 'revoked']);
        }

        return back()->with('success', "Role revoked for {$userTarget->name}.");
    }
}

