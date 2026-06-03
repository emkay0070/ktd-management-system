<?php

namespace App\Http\Controllers;

use App\Models\DistrictEvent;
use Illuminate\Http\Request;

class DistrictEventController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_committee', 'district_official']), 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'registration_fee' => 'required|numeric|min:0',
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
            'status' => 'Scheduled',
            'is_published' => false, // Always defaults to false for committee review
        ]);

        return back()->with('message', 'District event scheduled successfully.');
    }

    public function destroy(DistrictEvent $event)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_official']), 403);
        abort_unless($event->district_id === $user->district_id, 403);

        $event->delete();
        return back()->with('message', 'Event removed.');
    }

    public function togglePublish(DistrictEvent $event)
    {
        $user = auth()->user();
        // Only District Directors can publish an event downwards
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_official']), 403);
        abort_unless($event->district_id === $user->district_id, 403);

        $event->is_published = !$event->is_published;
        $event->save();

        $state = $event->is_published ? 'broadcasted to all local clubs' : 'hidden from local clubs';
        return back()->with('message', "Event has been {$state}.");
    }
}
