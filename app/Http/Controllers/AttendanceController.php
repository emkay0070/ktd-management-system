<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'director', 403);

        $request->validate([
            'date' => 'required|date',
            'type' => 'required|string',
            'description' => 'nullable|string',
            'records' => 'required|array',
            'records.*.pathfinder_id' => 'nullable|exists:pathfinders,id',
            'records.*.master_guide_id' => 'nullable|exists:master_guides,id',
            'records.*.is_present' => 'required|boolean',
        ]);

        $session = AttendanceSession::create([
            'church_id' => $user->church_id,
            'date' => $request->date,
            'type' => $request->type,
            'description' => $request->description,
        ]);

        foreach ($request->records as $rec) {
            AttendanceRecord::create([
                'attendance_session_id' => $session->id,
                'pathfinder_id' => $rec['pathfinder_id'] ?? null,
                'master_guide_id' => $rec['master_guide_id'] ?? null,
                'is_present' => $rec['is_present'],
            ]);
        }

        return back()->with('message', 'Attendance logged successfully.');
    }

    public function destroy(AttendanceSession $session)
    {
        abort_unless(auth()->user()->church_id === $session->church_id, 403);
        $session->delete();
        return back()->with('message', 'Attendance session deleted.');
    }
}
