<?php

namespace App\Http\Controllers;

use App\Models\DistrictTask;
use App\Models\TaskSubmission;
use Illuminate\Http\Request;

class DistrictTaskController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_committee', 'district_official']), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'points' => 'required|integer|min:1',
            'deadline' => 'required|date',
            'quarter' => 'required|string',
        ]);

        DistrictTask::create([
            'district_id' => $user->district_id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'points' => $validated['points'],
            'deadline' => $validated['deadline'],
            'quarter' => $validated['quarter'],
            'year' => now()->year,
            'status' => 'Active',
        ]);

        return back()->with('message', 'Competition task posted successfully.');
    }

    public function destroy(DistrictTask $task)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_official']), 403);
        abort_unless($task->district_id === $user->district_id, 403);

        $task->delete();
        return back()->with('message', 'Task removed.');
    }

    public function reviewSubmission(Request $request, TaskSubmission $submission)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_committee', 'district_official']), 403);
        
        $validated = $request->validate([
            'status' => 'required|in:Approved,Rejected',
            'feedback' => 'nullable|string',
            'points_awarded' => 'required_if:status,Approved|integer|min:0'
        ]);

        $submission->update([
            'status' => $validated['status'],
            'feedback' => $validated['feedback'],
            'points_awarded' => $validated['status'] === 'Approved' ? $validated['points_awarded'] : 0,
        ]);

        return back()->with('message', "Submission mark as {$validated['status']}.");
    }
}
