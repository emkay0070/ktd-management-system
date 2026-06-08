<?php

namespace App\Http\Controllers;

use App\Models\DistrictEvent;
use Illuminate\Http\Request;

class DistrictEventController extends Controller
{
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $this->authorize('create', DistrictEvent::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'registration_fee' => 'required|numeric|min:0',
            'message_type' => 'required|in:official_event,training_seminar,general_assembly',
        ]);

        DistrictEvent::create([
            'district_id' => $user->district_id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'location' => $validated['location'],
            'description' => $validated['description'],
            'registration_fee' => $validated['registration_fee'],
            'operational_status' => 'Scheduled',
            'workflow_status' => 'draft',
            'message_type' => $validated['message_type'],
        ]);

        return back()->with('message', 'District event created as draft.');
    }

    public function requestApproval(Request $request, DistrictEvent $event)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_programs_coordinator', 'district_curriculum_coordinator', 'super_admin']), 403);
        abort_unless($event->district_id === $user->district_id, 403);

        $event->update(['workflow_status' => 'pending_approval']);

        return back()->with('message', 'Event submitted for District Director approval.');
    }

    public function approve(Request $request, DistrictEvent $event)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_director', 'super_admin']), 403);
        abort_unless($event->district_id === $user->district_id, 403);

        $event->update([
            'workflow_status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return back()->with('message', 'Event approved. The coordinator can now publish it.');
    }

    public function publish(Request $request, DistrictEvent $event)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_programs_coordinator', 'district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($event->district_id === $user->district_id, 403);

        if ($event->workflow_status !== 'approved' && !$user->hasAnyRole(['district_director', 'super_admin'])) {
            return back()->withErrors(['event' => 'This event must be approved by the Director before publishing.']);
        }

        $event->update(['workflow_status' => 'published']);

        return back()->with('message', 'Event published to the district.');
    }

    public function destroy(DistrictEvent $event)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $this->authorize('delete', $event);
        abort_unless($event->district_id === $user->district_id, 403);

        $event->delete();
        return back()->with('message', 'Event removed.');
    }

    public function togglePublish(DistrictEvent $event)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $this->authorize('publish', $event);
        abort_unless($event->district_id === $user->district_id, 403);

        if ($event->workflow_status === 'pending_approval') {
            return back()->withErrors(['event' => 'This event requires District Director approval before publishing.']);
        }

        $newStatus = $event->workflow_status === 'published' ? 'draft' : 'published';
        $event->workflow_status = $newStatus;
        $event->save();

        $state = $event->workflow_status === 'published' ? 'broadcasted to all local clubs' : 'hidden from local clubs';
        return back()->with('message', "Event has been {$state}.");
    }
}
