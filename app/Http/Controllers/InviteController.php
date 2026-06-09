<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Role;
use Illuminate\Support\Facades\Auth;

class InviteController extends Controller
{
    /**
     * Display the invitation details to the user.
     */
    public function show(Request $request)
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'This invitation link is invalid or has expired.');
        }

        $roleName = $request->query('role');
        $scopeType = $request->query('scope_type');
        $scopeId = $request->query('scope_id');

        $role = Role::where('name', $roleName)->firstOrFail();
        
        $scopeName = 'Unknown Organization';
        if ($scopeType === 'App\Models\District') {
            $district = \App\Models\District::find($scopeId);
            if ($district) {
                $scopeName = $district->name;
            }
        }

        return Inertia::render('Auth/AcceptInvite', [
            'invite' => [
                'role_name' => $roleName,
                'role_display' => $role->display_name,
                'scope_type' => $scopeType,
                'scope_id' => $scopeId,
                'scope_name' => $scopeName,
                // Pass the current full URL so we can re-use the signature on POST
                'post_url' => $request->fullUrl(),
            ],
            'is_logged_in' => Auth::check(),
            'user' => Auth::user(),
        ]);
    }

    /**
     * Accept the invitation and attach the role.
     */
    public function accept(Request $request)
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'This invitation link is invalid or has expired.');
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user) {
            // Should not happen if UI forces login first, but handle just in case
            return redirect()->route('login');
        }

        $roleName = $request->query('role');
        $scopeType = $request->query('scope_type');
        $scopeId = $request->query('scope_id');

        $role = Role::where('name', $roleName)->firstOrFail();

        // Check if user already has this role in this scope
        $hasRole = $user->roles()
            ->where('role_id', $role->id)
            ->wherePivot('entity_type', $scopeType)
            ->wherePivot('entity_id', $scopeId)
            ->exists();

        if (!$hasRole) {
            $user->roles()->attach($role->id, [
                'status' => 'active', // Auto-approve since they were invited via valid link
                'entity_type' => $scopeType,
                'entity_id' => $scopeId,
                'assigned_at' => now(),
            ]);
            
            // Also update fallback district_id if applicable
            if ($scopeType === 'App\Models\District' && !$user->district_id) {
                $user->update(['district_id' => $scopeId]);
            }

            // Sync to communication channels
            app(\App\Services\CommunicationService::class)->syncUserToChannels($user);
        }

        return redirect()->route('dashboard')->with('message', 'Invitation accepted successfully.');
    }
}
