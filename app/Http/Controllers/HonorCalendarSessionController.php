<?php

namespace App\Http\Controllers;

use App\Models\HonorCalendarSession;
use Illuminate\Http\Request;

class HonorCalendarSessionController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $validated = $request->validate([
            'honour_id' => 'required|exists:honours,id',
            'session_type' => 'required|in:theory,practical',
            'scheduled_date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'instructor_id' => 'nullable|exists:users,id',
            'target_audience' => 'required|string|max:255',
        ]);

        HonorCalendarSession::create([
            'district_id' => $user->district_id,
            'honour_id' => $validated['honour_id'],
            'session_type' => $validated['session_type'],
            'scheduled_date' => $validated['scheduled_date'],
            'location' => $validated['location'],
            'instructor_id' => $validated['instructor_id'],
            'target_audience' => $validated['target_audience'],
        ]);

        return back()->with('message', 'Honor session scheduled successfully.');
    }

    public function destroy(Request $request, HonorCalendarSession $session)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($session->district_id === $user->district_id, 403);

        $session->delete();

        return back()->with('message', 'Honor session canceled.');
    }
}
