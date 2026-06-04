<?php

namespace App\Http\Controllers;

use App\Models\DistrictTask;
use App\Models\TaskSubmission;
use Illuminate\Http\Request;

class DistrictTaskController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', DistrictTask::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'points' => 'required|integer|min:1',
            'deadline' => 'required|date',
            'quarter' => 'required|string',
            'message_type' => 'required|in:official_directive,routine_task',
        ]);

        DistrictTask::create([
            'district_id' => auth()->user()->district_id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'points' => $validated['points'],
            'deadline' => $validated['deadline'],
            'quarter' => $validated['quarter'],
            'year' => now()->year,
            'workflow_status' => 'draft',
            'message_type' => $validated['message_type'],
        ]);

        return back()->with('message', 'Competition task posted as draft.');
    }

    public function destroy(DistrictTask $task)
    {
        $this->authorize('delete', $task);
        abort_unless($task->district_id === auth()->user()->district_id, 403);

        $task->delete();
        return back()->with('message', 'Task removed.');
    }

    public function toggleAssign(DistrictTask $task)
    {
        $this->authorize('assign', $task);
        abort_unless($task->district_id === auth()->user()->district_id, 403);

        $newStatus = $task->workflow_status === 'assigned' ? 'draft' : 'assigned';
        $task->update(['workflow_status' => $newStatus]);

        $state = $newStatus === 'assigned' ? 'assigned to clubs' : 'returned to draft';
        return back()->with('message', "Task has been {$state}.");
    }

    public function reviewSubmission(Request $request, TaskSubmission $submission)
    {
        $this->authorize('score', $submission->task);
        abort_unless($submission->task->district_id === auth()->user()->district_id, 403);
        
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

        return back()->with('message', "Submission marked as {$validated['status']}.");
    }
}
