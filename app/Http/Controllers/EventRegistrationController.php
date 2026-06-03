<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\DistrictEvent;
use App\Models\Pathfinder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventRegistrationController extends Controller
{
    /**
     * Bulk registration for a club
     */
    public function storeBulk(Request $request)
    {
        $user = auth()->user();
        abort_unless($user->church_id, 403, 'User not assigned to a church.');

        $validated = $request->validate([
            'district_event_id' => 'required|exists:district_events,id',
            'pathfinder_ids' => 'required|array',
            'pathfinder_ids.*' => 'exists:pathfinders,id',
        ]);

        foreach ($validated['pathfinder_ids'] as $pid) {
            // Ensure pathfinder belongs to the church
            $pathfinder = Pathfinder::where('id', $pid)->where('church_id', $user->church_id)->first();
            if (!$pathfinder) continue;

            Registration::firstOrCreate(
                [
                    'pathfinder_id' => $pid,
                    'district_event_id' => $validated['district_event_id'],
                ],
                [
                    'church_id' => $user->church_id,
                    'status' => 'pending',
                    'amount_paid' => 0,
                    'paid' => false
                ]
            );
        }

        return back()->with('message', 'Pathfinders registered successfully.');
    }

    /**
     * Local Club updates partial payment
     */
    public function updatePayment(Request $request, Registration $registration)
    {
        $user = auth()->user();
        // Allow club director or district treasurer
        abort_unless($user->church_id === $registration->church_id || in_array($user->role, ['district_director', 'district_committee']), 403);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $registration->update([
            'amount_paid' => $validated['amount'],
            'notes' => $validated['notes'],
        ]);

        return back()->with('message', 'Payment record updated.');
    }

    /**
     * District Approval (Final Confirmation)
     */
    public function approve(Registration $registration)
    {
        $user = auth()->user();
        // Strictly District Executive/Committee
        abort_unless(in_array($user->role, ['district_director', 'district_committee']), 403);

        $registration->update([
            'status' => 'approved',
            'paid' => true,
            'verified_by' => $user->id,
        ]);

        return back()->with('message', 'Registration approved and verified.');
    }

    /**
     * Delete registration
     */
    public function destroy(Registration $registration)
    {
        $user = auth()->user();
        abort_unless($user->church_id === $registration->church_id || $user->hasAnyRole(['district_director', 'district_official']), 403);

        $registration->delete();
        return back()->with('message', 'Registration cancelled.');
    }
}
