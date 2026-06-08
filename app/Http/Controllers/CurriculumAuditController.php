<?php

namespace App\Http\Controllers;

use App\Models\CurriculumAudit;
use Illuminate\Http\Request;

class CurriculumAuditController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $validated = $request->validate([
            'church_id' => 'required|exists:churches,id',
            'audit_date' => 'required|date',
            'teaching_quality_score' => 'required|integer|min:1|max:10',
            'record_keeping_score' => 'required|integer|min:1|max:10',
            'facilities_score' => 'required|integer|min:1|max:10',
            'comments' => 'nullable|string',
            'recommendations' => 'nullable|string',
        ]);

        CurriculumAudit::create([
            'district_id' => $user->district_id,
            'church_id' => $validated['church_id'],
            'audited_by' => $user->id,
            'audit_date' => $validated['audit_date'],
            'teaching_quality_score' => $validated['teaching_quality_score'],
            'record_keeping_score' => $validated['record_keeping_score'],
            'facilities_score' => $validated['facilities_score'],
            'comments' => $validated['comments'],
            'recommendations' => $validated['recommendations'],
        ]);

        return back()->with('message', 'Curriculum audit submitted successfully.');
    }

    public function destroy(Request $request, CurriculumAudit $audit)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($audit->district_id === $user->district_id, 403);

        $audit->delete();

        return back()->with('message', 'Audit record removed.');
    }
}
