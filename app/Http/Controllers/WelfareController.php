<?php

namespace App\Http\Controllers;

use App\Models\WelfareCase;
use App\Models\SocialEvent;
use App\Models\Church;
use App\Models\Pathfinder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelfareController extends Controller
{
    /**
     * Store a new welfare case.
     */
    public function storeCase(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_welfare_coordinator', 'district_director', 'super_admin']), 403);

        $validated = $request->validate([
            'church_id' => 'nullable|exists:churches,id',
            'user_id' => 'nullable|exists:users,id',
            'beneficiary_name' => 'nullable|string|max:255',
            'category' => 'required|string',
            'description' => 'required|string',
            'status' => 'required|in:open,review,assisted,closed',
        ]);

        WelfareCase::create([
            'district_id' => $user->district_id,
            'church_id' => $validated['church_id'],
            'user_id' => $validated['user_id'],
            'beneficiary_name' => $validated['beneficiary_name'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'status' => $validated['status'],
            'created_by' => $user->id,
        ]);

        return back()->with('message', 'Welfare case opened successfully.');
    }

    /**
     * Update a welfare case.
     */
    public function updateCase(Request $request, WelfareCase $case)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_welfare_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($case->district_id === $user->district_id, 403);

        $validated = $request->validate([
            'status' => 'required|in:open,review,assisted,closed',
            'support_provided' => 'nullable|string',
            'follow_up_notes' => 'nullable|string',
        ]);

        $case->update($validated);

        return back()->with('message', 'Welfare case updated.');
    }

    /**
     * Store a new social event.
     */
    public function storeEvent(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_welfare_coordinator', 'district_director', 'super_admin']), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'category' => 'required|string',
            'budget' => 'nullable|numeric',
        ]);

        SocialEvent::create([
            'district_id' => $user->district_id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'event_date' => $validated['event_date'],
            'category' => $validated['category'],
            'budget' => $validated['budget'] ?? 0,
            'created_by' => $user->id,
        ]);

        return back()->with('message', 'Social event planned.');
    }

    /**
     * Update a social event.
     */
    public function updateEvent(Request $request, SocialEvent $event)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_welfare_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($event->district_id === $user->district_id, 403);

        $validated = $request->validate([
            'status' => 'required|in:planned,ongoing,completed,cancelled',
            'attendance_count' => 'nullable|integer',
        ]);

        $event->update($validated);

        return back()->with('message', 'Social event updated.');
    }
}
