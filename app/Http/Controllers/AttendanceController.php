<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\MasterGuide;
use App\Models\Pathfinder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['director', 'club_secretary']), 403);
        abort_unless($user->church_id, 403);

        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'present_pathfinder_ids' => 'nullable|array',
            'present_pathfinder_ids.*' => 'integer|exists:pathfinders,id',
            'present_master_guide_ids' => 'nullable|array',
            'present_master_guide_ids.*' => 'integer|exists:master_guides,id',
            'force' => 'nullable|boolean',
        ]);

        $duplicate = AttendanceSession::query()
            ->where('church_id', $user->church_id)
            ->whereDate('date', $validated['date'])
            ->where('type', $validated['type'])
            ->first();

        if ($duplicate && ! $request->boolean('force')) {
            return back()->with('warning', "A {$validated['type']} session already exists for this date. Edit the existing session or confirm to replace it.");
        }

        if ($duplicate && $request->boolean('force')) {
            $duplicate->delete();
        }

        $session = AttendanceSession::create([
            'church_id' => $user->church_id,
            'date' => $validated['date'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
        ]);

        $this->syncRecords($session, $user->church_id, $validated);

        return back()->with('success', 'Attendance logged successfully.');
    }

    public function update(Request $request, AttendanceSession $session): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['director', 'club_secretary']), 403);
        abort_unless((int) $user->church_id === (int) $session->church_id, 403);

        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'present_pathfinder_ids' => 'nullable|array',
            'present_pathfinder_ids.*' => 'integer|exists:pathfinders,id',
            'present_master_guide_ids' => 'nullable|array',
            'present_master_guide_ids.*' => 'integer|exists:master_guides,id',
        ]);

        $duplicate = AttendanceSession::query()
            ->where('church_id', $user->church_id)
            ->whereDate('date', $validated['date'])
            ->where('type', $validated['type'])
            ->where('id', '!=', $session->id)
            ->first();

        if ($duplicate) {
            return back()->with('warning', "Another {$validated['type']} session already exists for this date.");
        }

        $session->update([
            'date' => $validated['date'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
        ]);

        $session->records()->delete();
        $this->syncRecords($session, $user->church_id, $validated);

        return back()->with('success', 'Attendance session updated.');
    }

    public function destroy(AttendanceSession $session): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['director', 'club_secretary']), 403);
        abort_unless((int) $user->church_id === (int) $session->church_id, 403);

        $session->delete();

        return back()->with('success', 'Attendance session deleted.');
    }

    private function syncRecords(AttendanceSession $session, int $churchId, array $validated): void
    {
        $presentPathfinderIds = collect($validated['present_pathfinder_ids'] ?? [])->map(fn ($id) => (int) $id);
        $presentMasterGuideIds = collect($validated['present_master_guide_ids'] ?? [])->map(fn ($id) => (int) $id);

        $pathfinderIds = Pathfinder::query()
            ->where('church_id', $churchId)
            ->pluck('id');

        $masterGuideIds = MasterGuide::query()
            ->where('church_id', $churchId)
            ->pluck('id');

        if ($presentPathfinderIds->diff($pathfinderIds)->isNotEmpty()
            || $presentMasterGuideIds->diff($masterGuideIds)->isNotEmpty()) {
            abort(422, 'One or more selected members do not belong to your club.');
        }

        foreach ($pathfinderIds as $pathfinderId) {
            AttendanceRecord::create([
                'attendance_session_id' => $session->id,
                'pathfinder_id' => $pathfinderId,
                'master_guide_id' => null,
                'is_present' => $presentPathfinderIds->contains($pathfinderId),
            ]);
        }

        foreach ($masterGuideIds as $masterGuideId) {
            AttendanceRecord::create([
                'attendance_session_id' => $session->id,
                'pathfinder_id' => null,
                'master_guide_id' => $masterGuideId,
                'is_present' => $presentMasterGuideIds->contains($masterGuideId),
            ]);
        }
    }
}
