<?php

namespace App\Observers;

use App\Models\Pathfinder;

class PathfinderObserver
{
    /**
     * Handle the Pathfinder "created" event.
     */
    public function created(Pathfinder $pathfinder): void
    {
        \App\Models\TimelineEvent::create([
            'pathfinder_id' => $pathfinder->id,
            'title' => 'Club Registration',
            'description' => 'Officially registered to ' . ($pathfinder->church->name ?? 'the local club') . '.',
            'icon' => 'Shield',
            'event_date' => now(),
        ]);
    }

    public function updated(Pathfinder $pathfinder): void
    {
        if ($pathfinder->isDirty('is_inducted') && $pathfinder->is_inducted) {
            \App\Models\TimelineEvent::create([
                'pathfinder_id' => $pathfinder->id,
                'title' => 'Induction Ceremony',
                'description' => 'Officially inducted as a Pathfinder.',
                'icon' => 'CheckCircle2',
                'event_date' => now(),
            ]);
        }

        if ($pathfinder->isDirty('insured_yearly') && $pathfinder->insured_yearly) {
            \App\Models\TimelineEvent::create([
                'pathfinder_id' => $pathfinder->id,
                'title' => 'Insurance Activated',
                'description' => 'Pathfinder insurance verified for the current year.',
                'icon' => 'Heart',
                'event_date' => now(),
            ]);
        }
    }
}
