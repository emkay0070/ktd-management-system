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

        /** @var \App\Models\User $user */
        $user = $request->user();
        
        DistrictBulletin::create([
            'district_id' => $user->district_id,
            'author_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'level' => $validated['level'],
            'workflow_status' => 'draft',
            'message_type' => $validated['message_type'],
            'department' => $validated['department'],
            'target_audience' => $validated['target_audience'],
            'requires_acknowledgement' => $validated['requires_acknowledgement'] ?? false,
            'expires_at' => $validated['expires_at'],
        ]);

        return back()->with('message', 'District bulletin created as draft.');
    }

    public function requestApproval(Request $request, DistrictBulletin $bulletin)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_communication_coordinator', 'district_curriculum_coordinator', 'super_admin']), 403);
        abort_unless($bulletin->district_id === $user->district_id, 403);

        $bulletin->update(['workflow_status' => 'pending_approval']);

        return back()->with('message', 'Bulletin submitted for District Director approval.');
    }

    public function destroy(Request $request, DistrictBulletin $bulletin)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $this->authorize('delete', $bulletin);
        abort_unless($bulletin->district_id === $user->district_id, 403);

        $bulletin->delete();
        return back()->with('message', 'Bulletin removed.');
    }

    public function toggle(Request $request, DistrictBulletin $bulletin)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $this->authorize('publish', $bulletin);
        abort_unless($bulletin->district_id === $user->district_id, 403);

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
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_director', 'super_admin']), 403);
        abort_unless($bulletin->district_id === $user->district_id, 403);

        $bulletin->update([
            'workflow_status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return back()->with('message', 'Bulletin approved. The coordinator can now publish it.');
    }

    public function publish(Request $request, DistrictBulletin $bulletin)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_communication_coordinator', 'district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($bulletin->district_id === $user->district_id, 403);

        if ($bulletin->workflow_status !== 'approved' && !$user->hasAnyRole(['district_director', 'super_admin'])) {
            return back()->withErrors(['bulletin' => 'This bulletin must be approved by the Director before publishing.']);
        }

        $bulletin->update(['workflow_status' => 'published']);

        return back()->with('message', 'Bulletin published to the district.');
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
