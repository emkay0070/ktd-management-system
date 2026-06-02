<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pathfinder;
use App\Models\CurriculumRequirement;
use App\Models\CurriculumProgress;

class CurriculumController extends Controller
{
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
}
