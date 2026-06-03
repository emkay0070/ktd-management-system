<?php

namespace App\Http\Controllers;

use App\Models\DistrictAppraisal;
use App\Models\Church;
use Illuminate\Http\Request;

class DistrictAppraisalController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_committee', 'district_official']), 403);

        $validated = $request->validate([
            'church_id' => 'required|exists:churches,id',
            'quarter' => 'required|in:Q1,Q2,Q3,Q4',
            'year' => 'required|integer',
            'score_technical' => 'required|integer|min:0|max:30',
            'score_admin' => 'required|integer|min:0|max:30',
            'score_activities' => 'required|integer|min:0|max:40',
            'comments' => 'nullable|string',
        ]);

        $total = $validated['score_technical'] + $validated['score_admin'] + $validated['score_activities'];

        DistrictAppraisal::updateOrCreate(
            [
                'church_id' => $validated['church_id'],
                'quarter' => $validated['quarter'],
                'year' => $validated['year'],
            ],
            [
                'district_id' => $user->district_id,
                'score_technical' => $validated['score_technical'],
                'score_admin' => $validated['score_admin'],
                'score_activities' => $validated['score_activities'],
                'total_score' => $total,
                'comments' => $validated['comments'],
            ]
        );

        return back()->with('message', "Appraisal submitted for {$validated['quarter']} {$validated['year']}. Total Score: {$total}/100.");
    }

    public function destroy(DistrictAppraisal $appraisal)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_official']), 403);
        abort_unless($appraisal->district_id === $user->district_id, 403);

        $appraisal->delete();
        return back()->with('message', 'Appraisal removed.');
    }
}
