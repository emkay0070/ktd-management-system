<?php

namespace App\Http\Controllers;

use App\Models\PendingParentLink;
use App\Services\AuditService;
use Illuminate\Http\Request;

class ParentLinkController extends Controller
{
    /**
     * Approve a pending link request.
     */
    public function approve(PendingParentLink $link)
    {
        $this->authorize('approve_parent_link');

        $link->update(['status' => 'approved']);

        AuditService::log(
            'approved_parent_link',
            "Approved parent link for {$link->pathfinder?->name} → {$link->user?->name}",
            $link
        );

        return back()->with('success', 'Parent link approved successfully.');
    }

    /**
     * Reject a pending link request.
     */
    public function reject(PendingParentLink $link)
    {
        $this->authorize('approve_parent_link');

        $link->update(['status' => 'rejected']);

        AuditService::log(
            'rejected_parent_link',
            "Rejected parent link for {$link->pathfinder?->name} → {$link->user?->name}",
            $link
        );

        return back()->with('info', 'Parent link request rejected.');
    }

    /**
     * Store a manual link (used by Director — auto-approved).
     */
    public function store(Request $request)
    {
        $this->authorize('link_parent_child');

        $request->validate([
            'user_id'       => 'required|exists:users,id',
            'pathfinder_id' => 'required|exists:pathfinders,id',
        ]);

        $link = PendingParentLink::updateOrCreate(
            [
                'user_id'       => $request->user_id,
                'pathfinder_id' => $request->pathfinder_id,
            ],
            ['status' => 'approved']
        );

        AuditService::log(
            'manual_parent_link',
            "Director manually linked parent (user #{$request->user_id}) to pathfinder #{$request->pathfinder_id}",
            $link
        );

        return back()->with('success', 'Pathfinder linked to parent successfully.');
    }
}
