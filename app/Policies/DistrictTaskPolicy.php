<?php

namespace App\Policies;

use App\Models\DistrictTask;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DistrictTaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_programs_coordinator', 'district_committee', 'district_official', 'club_director']);
    }

    public function view(User $user, DistrictTask $task): bool
    {
        if ($user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_programs_coordinator'])) {
            return true;
        }

        // Clubs can only view if assigned (published) or closed
        return in_array($task->workflow_status, ['assigned', 'closed', 'reviewed']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_programs_coordinator']);
    }

    public function update(User $user, DistrictTask $task): bool
    {
        if ($user->hasAnyRole(['super_admin', 'district_director', 'district_secretary'])) {
            return true;
        }

        if ($user->hasRole('district_programs_coordinator')) {
            // Production can only edit before it's approved
            return in_array($task->workflow_status, ['draft', 'pending_review']);
        }

        return false;
    }

    public function approve(User $user, DistrictTask $task): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']);
    }

    public function assign(User $user, DistrictTask $task): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']);
    }

    public function score(User $user, DistrictTask $task): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']);
    }

    public function delete(User $user, DistrictTask $task): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']);
    }
}
