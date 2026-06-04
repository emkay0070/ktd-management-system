<?php

namespace App\Http\Controllers;

use App\Models\DistrictEvent;
use Illuminate\Http\Request;

class DistrictEventController extends Controller
{
    public function store(Request $request)
    {
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
            'district_id' => auth()->user()->district_id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'location' => $validated['location'],
            'description' => $validated['description'],
            'registration_fee' => $validated['registration_fee'],
            'operational_status' => 'Scheduled',
            'workflow_status' => 'draft', // Always defaults to draft for committee review
            'message_type' => $validated['message_type'],
        ]);

        return back()->with('message', 'District event scheduled as draft.');
    }

    public function destroy(DistrictEvent $event)
    {
        $this->authorize('delete', $event);
        abort_unless($event->district_id === auth()->user()->district_id, 403);

        $event->delete();
        return back()->with('message', 'Event removed.');
    }

    public function togglePublish(DistrictEvent $event)
    {
        $this->authorize('publish', $event);
        abort_unless($event->district_id === auth()->user()->district_id, 403);

        $newStatus = $event->workflow_status === 'published' ? 'draft' : 'published';
        $event->workflow_status = $newStatus;
        $event->save();

        $state = $event->workflow_status === 'published' ? 'broadcasted to all local clubs' : 'hidden from local clubs';
        return back()->with('message', "Event has been {$state}.");
    }
}
