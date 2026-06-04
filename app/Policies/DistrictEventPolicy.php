<?php

namespace App\Policies;

use App\Models\DistrictEvent;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DistrictEventPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_programs_coordinator', 'district_committee', 'district_official', 'club_director']);
    }

    public function view(User $user, DistrictEvent $event): bool
    {
        if ($user->hasAnyRole(['super_admin', 'district_director', 'district_secretary'])) {
            return true;
        }

        // Production gets to view all
        if ($user->hasRole('district_programs_coordinator')) {
            return true;
        }

        // Everyone else only views if published
        return $event->workflow_status === 'published';
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_programs_coordinator']);
    }

    public function update(User $user, DistrictEvent $event): bool
    {
        if ($user->hasAnyRole(['super_admin', 'district_director', 'district_secretary'])) {
            return true;
        }

        if ($user->hasRole('district_programs_coordinator')) {
            // Production can only edit before it's approved
            return in_array($event->workflow_status, ['draft', 'pending_review']);
        }

        return false;
    }

    public function approve(User $user, DistrictEvent $event): bool
    {
        // Only Authority can approve
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']);
    }

    public function publish(User $user, DistrictEvent $event): bool
    {
        // Only Authority can publish
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']);
    }

    public function delete(User $user, DistrictEvent $event): bool
    {
        // Only Authority can delete
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']);
    }
}
