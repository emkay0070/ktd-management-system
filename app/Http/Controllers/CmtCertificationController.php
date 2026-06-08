<?php

namespace App\Http\Controllers;

use App\Models\CmtCertification;
use Illuminate\Http\Request;

class CmtCertificationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'certification_type' => 'required|string|max:255',
            'status' => 'required|in:in-progress,completed',
        ]);

        CmtCertification::create([
            'user_id' => $validated['user_id'],
            'certification_type' => $validated['certification_type'],
            'status' => $validated['status'],
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
            'certified_by' => $validated['status'] === 'completed' ? $user->id : null,
        ]);

        return back()->with('message', 'CMT Certification record created.');
    }

    public function update(Request $request, CmtCertification $certification)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $validated = $request->validate([
            'status' => 'required|in:in-progress,completed',
        ]);

        $certification->update([
            'status' => $validated['status'],
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
            'certified_by' => $validated['status'] === 'completed' ? $user->id : null,
        ]);

        return back()->with('message', 'CMT Certification updated.');
    }

    public function destroy(Request $request, CmtCertification $certification)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $certification->delete();

        return back()->with('message', 'CMT Certification removed.');
    }
}
