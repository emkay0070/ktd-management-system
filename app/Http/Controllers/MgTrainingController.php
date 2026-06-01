<?php

namespace App\Http\Controllers;

use App\Models\MasterGuide;
use App\Models\MgTraining;
use Illuminate\Http\Request;

class MgTrainingController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id, 403);

        $data = $request->validate([
            'master_guide_id' => 'required|integer|exists:master_guides,id',
            'training_start_date' => 'required|date',
            'expected_completion_date' => 'nullable|date',
            'status' => 'required|string|in:ongoing,completed,paused',
            'assigned_mentor_id' => 'nullable|integer|exists:master_guides,id',
        ]);

        $mg = MasterGuide::query()
            ->where('id', $data['master_guide_id'])
            ->where('church_id', $user->church_id)
            ->first();
        if (!$mg) {
            return back()->withErrors(['master_guide_id' => 'Invalid Master Guide for this church.']);
        }

        if (!empty($data['assigned_mentor_id'])) {
            $mentor = MasterGuide::query()
                ->where('id', $data['assigned_mentor_id'])
                ->where('church_id', $user->church_id)
                ->first();
            if (!$mentor) {
                return back()->withErrors(['assigned_mentor_id' => 'Invalid mentor for this church.']);
            }
        }

        MgTraining::updateOrCreate(
            ['master_guide_id' => $mg->id],
            [
                'training_start_date' => $data['training_start_date'],
                'expected_completion_date' => $data['expected_completion_date'] ?? null,
                'status' => $data['status'],
                'assigned_mentor_id' => $data['assigned_mentor_id'] ?? null,
            ],
        );

        return back()->with('message', 'Training record saved.');
    }

    public function update(Request $request, MgTraining $mgTraining)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id, 403);
        abort_unless($mgTraining->masterGuide && $mgTraining->masterGuide->church_id === $user->church_id, 403);

        $data = $request->validate([
            'training_start_date' => 'required|date',
            'expected_completion_date' => 'nullable|date',
            'status' => 'required|string|in:ongoing,completed,paused',
            'assigned_mentor_id' => 'nullable|integer|exists:master_guides,id',
        ]);

        if (!empty($data['assigned_mentor_id'])) {
            $mentor = MasterGuide::query()
                ->where('id', $data['assigned_mentor_id'])
                ->where('church_id', $user->church_id)
                ->first();
            if (!$mentor) {
                return back()->withErrors(['assigned_mentor_id' => 'Invalid mentor for this church.']);
            }
        }

        $mgTraining->update([
            'training_start_date' => $data['training_start_date'],
            'expected_completion_date' => $data['expected_completion_date'] ?? null,
            'status' => $data['status'],
            'assigned_mentor_id' => $data['assigned_mentor_id'] ?? null,
        ]);

        return back()->with('message', 'Training record updated.');
    }

    public function destroy(Request $request, MgTraining $mgTraining)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id, 403);
        abort_unless($mgTraining->masterGuide && $mgTraining->masterGuide->church_id === $user->church_id, 403);

        $mgTraining->delete();

        return back()->with('message', 'Training record removed.');
    }
}

