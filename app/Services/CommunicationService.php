<?php

namespace App\Services;

use App\Models\CommunicationChannel;
use App\Models\CommunicationParticipant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CommunicationService
{
    /**
     * Create or retrieve a channel for a specific model (Class, Unit, etc.)
     */
    public function getOrCreateChannelForModel(Model $model, string $type, ?string $name = null)
    {
        $channel = CommunicationChannel::where('model_type', get_class($model))
            ->where('model_id', $model->id)
            ->where('type', $type)
            ->first();

        if (!$channel) {
            $channel = CommunicationChannel::create([
                'name' => $name ?? $this->getDefaultName($model),
                'type' => $type,
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'slug' => Str::slug($type . '-' . $model->id . '-' . Str::random(4)),
                'created_by' => 1, // System or Admin
            ]);
        }

        return $channel;
    }

    /**
     * Synchronize a user to all relevant channels based on their current assignments
     */
    public function syncUserToChannels(User $user)
    {
        // 1. Club Channel
        if ($user->church_id) {
            $church = \App\Models\Church::find($user->church_id);
            if ($church) {
                $channel = $this->getOrCreateChannelForModel($church, 'club');
                $this->addParticipant($channel, $user);
            }
        }

        // 2. District Channel
        $districtId = $user->district_id ?? $user->church?->district_id;
        if ($districtId) {
            $district = \App\Models\District::find($districtId);
            if ($district) {
                $channel = $this->getOrCreateChannelForModel($district, 'district');
                $this->addParticipant($channel, $user);
            }
        }

        // 3. Class Channels
        // If user is a Master Guide teaching a class
        $mgProfile = $user->masterGuide;
        if ($mgProfile) {
            // Assigned Class
            if ($mgProfile->assigned_class_id) {
                $class = \App\Models\PathfinderClass::find($mgProfile->assigned_class_id);
                if ($class) {
                    $channel = $this->getOrCreateChannelForModel($class, 'class');
                    $this->addParticipant($channel, $user, 'moderator');
                }
            }
            
            // Classes they lead via ClassLeaderAssignment
            $assignments = \App\Models\ClassLeaderAssignment::where('master_guide_id', $mgProfile->id)->get();
            foreach ($assignments as $assignment) {
                $class = \App\Models\PathfinderClass::find($assignment->class_id);
                if ($class) {
                    $channel = $this->getOrCreateChannelForModel($class, 'class');
                    $this->addParticipant($channel, $user, 'moderator');
                }
            }
        }

        // 4. Unit Channels
        if ($mgProfile) {
            $unitAsCounselor = \App\Models\UnitRole::where('counselor_id', $mgProfile->id)->first();
            if ($unitAsCounselor) {
                $unit = \App\Models\Unit::find($unitAsCounselor->unit_id);
                if ($unit) {
                    $channel = $this->getOrCreateChannelForModel($unit, 'unit');
                    $this->addParticipant($channel, $user, 'moderator');
                }
            }
        }

        // 5. Parent Logic
        if ($user->hasRole('parent')) {
            $pathfinders = \App\Models\Pathfinder::where('parent_user_id', $user->id)->get();
            foreach ($pathfinders as $pathfinder) {
                // Class channel for their child
                if ($pathfinder->class_id) {
                    $class = \App\Models\PathfinderClass::find($pathfinder->class_id);
                    if ($class) {
                        $channel = $this->getOrCreateChannelForModel($class, 'class');
                        $this->addParticipant($channel, $user);
                    }
                }
                
                // Unit channel for their child
                $unitMembership = \App\Models\UnitMember::where('pathfinder_id', $pathfinder->id)->first();
                if ($unitMembership) {
                    $unit = \App\Models\Unit::find($unitMembership->unit_id);
                    if ($unit) {
                        $channel = $this->getOrCreateChannelForModel($unit, 'unit');
                        $this->addParticipant($channel, $user);
                    }
                }
            }
        }
    }

    protected function addParticipant(CommunicationChannel $channel, User $user, string $role = 'member')
    {
        CommunicationParticipant::updateOrCreate(
            ['channel_id' => $channel->id, 'user_id' => $user->id],
            ['role' => $role]
        );
    }

    protected function getDefaultName(Model $model): string
    {
        if (isset($model->name)) return $model->name;
        if (isset($model->title)) return $model->title;
        return class_basename($model) . ' Channel';
    }
}
