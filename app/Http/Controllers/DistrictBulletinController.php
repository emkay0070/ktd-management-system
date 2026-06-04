<?php

namespace App\Http\Controllers;

use App\Models\DistrictBulletin;
use Illuminate\Http\Request;

class DistrictBulletinController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', DistrictBulletin::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'level' => 'required|in:Info,Warning,Urgent',
            'expires_at' => 'nullable|date',
            'message_type' => 'required|in:directive,bulletin,reminder,event_update,engagement_post',
        ]);

        DistrictBulletin::create([
            'district_id' => auth()->user()->district_id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'level' => $validated['level'],
            'workflow_status' => 'draft',
            'message_type' => $validated['message_type'],
            'expires_at' => $validated['expires_at'],
        ]);

        return back()->with('message', 'District bulletin created as draft.');
    }

    public function destroy(DistrictBulletin $bulletin)
    {
        $this->authorize('delete', $bulletin);
        abort_unless($bulletin->district_id === auth()->user()->district_id, 403);

        $bulletin->delete();
        return back()->with('message', 'Bulletin removed.');
    }

    public function toggle(DistrictBulletin $bulletin)
    {
        $this->authorize('publish', $bulletin);
        abort_unless($bulletin->district_id === auth()->user()->district_id, 403);

        $newStatus = $bulletin->workflow_status === 'published' ? 'draft' : 'published';
        $bulletin->update(['workflow_status' => $newStatus]);
        return back()->with('message', "Bulletin status updated to {$newStatus}.");
    }
}
