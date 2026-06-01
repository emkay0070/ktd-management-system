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
        abort_unless($request->user()->hasRole('super_admin'), 403);

        $church->update(['status' => 'approved']);

        return back()->with('success', "Church \"{$church->name}\" has been approved.");
    }

    /**
     * Reject a pending church registration.
     */
    public function rejectChurch(Request $request, Church $church): RedirectResponse
    {
        abort_unless($request->user()->hasRole('super_admin'), 403);

        $church->update(['status' => 'rejected']);

        return back()->with('success', "Church \"{$church->name}\" has been rejected.");
    }

    /**
     * Approve a pending leadership role for a user.
     * Activates the first pending role pivot found on the user.
     */
    public function approveRole(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->hasRole('super_admin'), 403);

        $pendingRole = $user->roles()->wherePivot('status', 'pending')->first();

        if ($pendingRole) {
            $user->roles()->updateExistingPivot($pendingRole->id, ['status' => 'active']);
        }

        return back()->with('success', "Role approved for {$user->name}.");
    }

    /**
     * Reject (revoke) a pending leadership role for a user.
     */
    public function rejectRole(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->hasRole('super_admin'), 403);

        $pendingRole = $user->roles()->wherePivot('status', 'pending')->first();

        if ($pendingRole) {
            $user->roles()->updateExistingPivot($pendingRole->id, ['status' => 'revoked']);
        }

        return back()->with('success', "Role revoked for {$user->name}.");
    }
}

