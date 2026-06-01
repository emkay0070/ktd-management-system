<?php

namespace App\Http\Controllers;

use App\Models\TaskSubmission;
use App\Models\DistrictTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskSubmissionController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();
        abort_unless($user && $user->role === 'director', 403);
        
        $validated = $request->validate([
            'district_task_id' => 'required|exists:district_tasks,id',
            'evidence' => 'required|image|max:5120', // Max 5MB
        ]);

        $task = DistrictTask::findOrFail($validated['district_task_id']);
        abort_unless($task->status === 'Active', 400, 'This task is closed.');

        // Check if already submitted
        $existing = TaskSubmission::where('district_task_id', $task->id)
            ->where('church_id', $user->church_id)
            ->first();

        if ($existing) {
            return back()->with('error', 'You have already submitted evidence for this task.');
        }

        $path = $request->file('evidence')->store('submissions', 'public');

        TaskSubmission::create([
            'district_task_id' => $task->id,
            'church_id' => $user->church_id,
            'evidence_path' => $path,
            'status' => 'Pending Review',
        ]);

        return back()->with('message', 'Mission evidence uploaded! Awaiting district review.');
    }
}
