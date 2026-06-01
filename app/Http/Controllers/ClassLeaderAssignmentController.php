<?php

namespace App\Http\Controllers;

use App\Models\ClassLeaderAssignment;
use App\Models\MasterGuide;
use App\Models\PathfinderClass;
use Illuminate\Http\Request;

class ClassLeaderAssignmentController extends Controller
{
    public function store(Request $request, PathfinderClass $class)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id, 403);

        $data = $request->validate([
            'master_guide_id' => 'required|integer|exists:master_guides,id',
            'role' => 'required|string|in:master_guide,counselor,instructor',
        ]);

        $mg = MasterGuide::query()
            ->where('id', $data['master_guide_id'])
            ->where('church_id', $user->church_id)
            ->first();

        if (!$mg) {
            return back()->withErrors(['master_guide_id' => 'Invalid Master Guide for this church.']);
        }

        ClassLeaderAssignment::firstOrCreate([
            'class_id' => $class->id,
            'master_guide_id' => $mg->id,
            'role' => $data['role'],
        ]);

        return back()->with('message', 'Class leader assigned.');
    }

    public function destroy(Request $request, PathfinderClass $class, ClassLeaderAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id, 403);

        abort_unless($assignment->class_id === $class->id, 404);
        abort_unless($assignment->masterGuide && $assignment->masterGuide->church_id === $user->church_id, 403);

        $assignment->delete();

        return back()->with('message', 'Class leader removed.');
    }
}

