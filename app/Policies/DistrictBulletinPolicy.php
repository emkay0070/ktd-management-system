<?php

namespace App\Policies;

use App\Models\DistrictBulletin;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DistrictBulletinPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_communication_coordinator', 'district_programs_coordinator', 'district_curriculum_coordinator', 'district_music_coordinator', 'district_pbe_coordinator', 'district_welfare_coordinator', 'club_director']);
    }

    public function view(User $user, DistrictBulletin $bulletin): bool
    {
        if ($user->hasAnyRole(['super_admin', 'district_director', 'district_secretary'])) {
            return true;
        }

        // Production gets to view all
        if ($user->hasRole('district_communication_coordinator')) {
            return true;
        }

        // Everyone else only views if published
        return $bulletin->workflow_status === 'published';
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_communication_coordinator']);
    }

    public function update(User $user, DistrictBulletin $bulletin): bool
    {
        if ($user->hasAnyRole(['super_admin', 'district_director', 'district_secretary'])) {
            return true;
        }

        if ($user->hasRole('district_communication_coordinator')) {
            // Production can only edit before it's approved
            return in_array($bulletin->workflow_status, ['draft', 'pending_review']);
        }

        return false;
    }

    public function publish(User $user, DistrictBulletin $bulletin): bool
    {
        if ($user->hasAnyRole(['super_admin', 'district_director', 'district_secretary'])) {
            return true; // Directors can publish anything
        }

        // Comms Coord can only publish non-directives
        if ($user->hasRole('district_communication_coordinator')) {
            return in_array($bulletin->message_type, ['bulletin', 'reminder', 'event_update', 'engagement_post']);
        }

        return false;
    }

    public function delete(User $user, DistrictBulletin $bulletin): bool
    {
        return $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']);
    }
}
