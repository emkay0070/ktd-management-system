<?php

namespace App\Http\Controllers;

use App\Models\Committee;
use App\Models\CommitteeMember;
use App\Models\MasterGuide;
use App\Models\Pathfinder;
use Illuminate\Http\Request;

class CommitteeController extends Controller
{
    public function storeMember(Request $request, string $type)
    {
        $user = $request->user();
        abort_unless($user && !$user->hasRole('super_admin'), 403);
        abort_unless($user->church_id, 403);
        abort_unless(in_array($type, ['executive', 'staff', 'pathfinder'], true), 404);

        $data = $request->validate([
            'role' => 'required|string|max:255',
            'member_type' => 'required|string|in:user,master_guide,pathfinder',
            'member_id' => 'required|integer',
        ]);

        $committee = Committee::firstOrCreate([
            'church_id' => $user->church_id,
            'type' => $type,
        ]);

        $payload = [
            'committee_id' => $committee->id,
            'role' => $data['role'],
            'user_id' => null,
            'master_guide_id' => null,
            'pathfinder_id' => null,
        ];

        if ($data['member_type'] === 'user') {
            // Only the current logged-in user is guaranteed to exist; allow adding self.
            if ((int) $data['member_id'] !== (int) $user->id) {
                return back()->withErrors(['member_id' => 'Only existing system users can be added.']);
            }
            $payload['user_id'] = $user->id;
        } elseif ($data['member_type'] === 'master_guide') {
            $mg = MasterGuide::query()
                ->where('id', $data['member_id'])
                ->where('church_id', $user->church_id)
                ->first();
            if (!$mg) {
                return back()->withErrors(['member_id' => 'Invalid Master Guide for this church.']);
            }
            $payload['master_guide_id'] = $mg->id;
        } else {
            $pf = Pathfinder::query()
                ->where('id', $data['member_id'])
                ->where('church_id', $user->church_id)
                ->first();
            if (!$pf) {
                return back()->withErrors(['member_id' => 'Invalid Pathfinder for this church.']);
            }
            $payload['pathfinder_id'] = $pf->id;
        }

        CommitteeMember::create($payload);

        return back()->with('message', 'Committee member added.');
    }

    public function destroyMember(Request $request, CommitteeMember $committeeMember)
    {
        $user = $request->user();
        abort_unless($user && !$user->hasRole('super_admin'), 403);
        abort_unless($user->church_id, 403);
        abort_unless($committeeMember->committee && $committeeMember->committee->church_id === $user->church_id, 403);

        $committeeMember->delete();

        return back()->with('message', 'Committee member removed.');
    }
}

