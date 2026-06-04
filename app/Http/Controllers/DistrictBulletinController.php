<?php

namespace App\Http\Controllers;

use App\Models\DistrictBulletin;
use App\Models\BulletinAcknowledgement;
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
            'department' => 'required|string',
            'target_audience' => 'required|in:All,Directors,Leaders',
            'requires_acknowledgement' => 'boolean',
        ]);

        $user = $request->user();
        $isDirector = $user->hasAnyRole(['district_director', 'super_admin']);
        
        // If it's a directive and not drafted by a director, it needs approval
        $workflowStatus = ($validated['message_type'] === 'directive' && !$isDirector) 
            ? 'pending_approval' 
            : 'draft';

        DistrictBulletin::create([
            'district_id' => $user->district_id,
            'author_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'level' => $validated['level'],
            'workflow_status' => $workflowStatus,
            'message_type' => $validated['message_type'],
            'department' => $validated['department'],
            'target_audience' => $validated['target_audience'],
            'requires_acknowledgement' => $validated['requires_acknowledgement'] ?? false,
            'expires_at' => $validated['expires_at'],
        ]);

        $msg = $workflowStatus === 'pending_approval' 
            ? 'Directive submitted for District Director approval.' 
            : 'District bulletin created as draft.';

        return back()->with('message', $msg);
    }

    public function destroy(Request $request, DistrictBulletin $bulletin)
    {
        $this->authorize('delete', $bulletin);
        abort_unless($bulletin->district_id === $request->user()->district_id, 403);

        $bulletin->delete();
        return back()->with('message', 'Bulletin removed.');
    }

    public function toggle(Request $request, DistrictBulletin $bulletin)
    {
        $this->authorize('publish', $bulletin);
        abort_unless($bulletin->district_id === $request->user()->district_id, 403);

        // Can't publish if pending approval
        if ($bulletin->workflow_status === 'pending_approval') {
            return back()->withErrors(['bulletin' => 'This directive requires Director approval before publishing.']);
        }

        $newStatus = $bulletin->workflow_status === 'published' ? 'draft' : 'published';
        $bulletin->update(['workflow_status' => $newStatus]);
        return back()->with('message', "Bulletin status updated to {$newStatus}.");
    }

    public function approve(Request $request, DistrictBulletin $bulletin)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_director', 'super_admin']), 403);
        abort_unless($bulletin->district_id === $user->district_id, 403);

        $bulletin->update([
            'workflow_status' => 'published',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return back()->with('message', 'Directive approved and published to the district.');
    }

    public function acknowledge(Request $request, DistrictBulletin $bulletin)
    {
        $user = $request->user();
        
        // Ensure user hasn't already acknowledged
        $existing = BulletinAcknowledgement::where('bulletin_id', $bulletin->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$existing) {
            BulletinAcknowledgement::create([
                'bulletin_id' => $bulletin->id,
                'user_id' => $user->id,
                'church_id' => $user->church_id,
                'acknowledged_at' => now(),
            ]);
        }

        return back()->with('message', 'Acknowledgement recorded.');
    }
}
