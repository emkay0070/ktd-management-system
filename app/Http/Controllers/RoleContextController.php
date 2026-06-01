<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RoleContextController extends Controller
{
    /**
     * Switch the user's active role context (stored in session).
     * This enables multi-role users to toggle which "dashboard" they operate in.
     */
    public function switch(Request $request)
    {
        $request->validate([
            'context' => 'required|string',
        ]);

        $user    = $request->user();
        $context = $request->input('context');

        // Verify user actually has this role and it's active
        $hasRole = $user->roles()
            ->where('roles.name', $context)
            ->wherePivot('status', 'active')
            ->exists();

        if (!$hasRole) {
            return back()->with('error', 'You do not have an active role: ' . $context);
        }

        session(['active_role_context' => $context]);

        return redirect()->route('dashboard')
            ->with('success', 'Switched to ' . ucfirst(str_replace('_', ' ', $context)) . ' view.');
    }
}
