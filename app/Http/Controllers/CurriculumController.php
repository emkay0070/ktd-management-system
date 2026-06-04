<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pathfinder;
use App\Models\CurriculumRequirement;
use App\Models\CurriculumProgress;
use App\Models\ClassAssignment;
use App\Models\CurriculumStandard;

class CurriculumController extends Controller
{
    /**
     * Sign off a requirement for a pathfinder.
     */
    public function signoff(Request $request, Pathfinder $pathfinder, CurriculumRequirement $requirement)
    {
        $user = $request->user();
        
        // Ensure user is a Master Guide and is assigned to the same class
        abort_unless($user->hasRole('master_guide'), 403);
        
        $masterGuide = $user->masterGuide;
        abort_unless($masterGuide && $masterGuide->church_id === $pathfinder->church_id, 403);
        
        $classAssignment = $pathfinder->classAssignment;
        abort_unless($classAssignment && $classAssignment->class_id === $masterGuide->assigned_class_id, 403);
        abort_unless($requirement->class_id === $masterGuide->assigned_class_id, 403);

        CurriculumProgress::firstOrCreate([
            'pathfinder_id' => $pathfinder->id,
            'requirement_id' => $requirement->id,
        ], [
            'completed_at' => now(),
            'verified_by' => $user->id,
        ]);

        return back()->with('message', 'Requirement signed off successfully.');
    }

    // ── Investiture Workflow ───────────────────────────────────────────────

    public function readyForReview(Request $request, ClassAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user->hasRole('director') && $user->church_id === $assignment->pathfinder->church_id, 403);

        $assignment->update(['investiture_status' => 'pending_review']);

        return back()->with('message', 'Pathfinder submitted for district curriculum review.');
    }

    public function recommend(Request $request, ClassAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user->hasRole('district_curriculum_coordinator'), 403);

        $request->validate(['notes' => 'nullable|string']);

        $assignment->update([
            'investiture_status' => 'recommended',
            'investiture_recommendation_notes' => $request->notes,
            'recommended_by' => $user->id,
            'recommended_at' => now(),
        ]);

        return back()->with('message', 'Recommendation sent to District Director.');
    }

    public function approve(Request $request, ClassAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user->hasRole('district_director') || $user->hasRole('super_admin'), 403);

        $assignment->update([
            'investiture_status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return back()->with('message', 'Investiture approved.');
    }

    public function markInvested(Request $request, ClassAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_director', 'district_curriculum_coordinator', 'super_admin']), 403);

        $assignment->update(['investiture_status' => 'invested']);

        return back()->with('message', 'Pathfinder marked as invested.');
    }

    // ── Curriculum Standards ───────────────────────────────────────────────

    public function storeStandard(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'department' => 'required|in:Pathfinders,Adventurers',
        ]);

        CurriculumStandard::create([
            'district_id' => $user->district_id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'department' => $validated['department'],
            'created_by' => $user->id,
            'workflow_status' => 'draft',
        ]);

        return back()->with('message', 'Curriculum standard created as draft.');
    }

    public function updateStandard(Request $request, CurriculumStandard $standard)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($standard->district_id === $user->district_id, 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'department' => 'required|in:Pathfinders,Adventurers',
        ]);

        $standard->update($validated);

        return back()->with('message', 'Curriculum standard updated.');
    }

    public function toggleStandardStatus(Request $request, CurriculumStandard $standard)
    {
        $user = $request->user();
        // Only Director can publish, but Coordinator can move to 'review' if we had that state.
        // For now, let's allow both to toggle draft/published as requested.
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($standard->district_id === $user->district_id, 403);

        $newStatus = $standard->workflow_status === 'published' ? 'draft' : 'published';
        $standard->update(['workflow_status' => $newStatus]);

        return back()->with('message', "Standard status updated to {$newStatus}.");
    }

    public function destroyStandard(Request $request, CurriculumStandard $standard)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($standard->district_id === $user->district_id, 403);

        $standard->delete();

        return back()->with('message', 'Curriculum standard removed.');
    }
}
