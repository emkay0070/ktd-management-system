<?php

namespace App\Http\Controllers;

use App\Models\DistrictBulletin;
use Illuminate\Http\Request;

class DistrictBulletinController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_committee', 'district_official']), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'level' => 'required|in:Info,Warning,Urgent',
            'expires_at' => 'nullable|date',
        ]);

        DistrictBulletin::create([
            'district_id' => $user->district_id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'level' => $validated['level'],
            'is_active' => true,
            'expires_at' => $validated['expires_at'],
        ]);

        return back()->with('message', 'District bulletin posted successfully.');
    }

    public function destroy(DistrictBulletin $bulletin)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_official']), 403);
        abort_unless($bulletin->district_id === $user->district_id, 403);

        $bulletin->delete();
        return back()->with('message', 'Bulletin removed.');
    }

    public function toggle(DistrictBulletin $bulletin)
    {
        $user = auth()->user();
        abort_unless($user && $user->hasAnyRole(['district_director', 'district_committee', 'district_official']), 403);
        abort_unless($bulletin->district_id === $user->district_id, 403);

        $bulletin->update(['is_active' => !$bulletin->is_active]);
        return back()->with('message', 'Bulletin status updated.');
    }
}
