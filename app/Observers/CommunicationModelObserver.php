<?php

namespace App\Observers;

use App\Services\CommunicationService;
use Illuminate\Database\Eloquent\Model;

class CommunicationModelObserver
{
    public function __construct(protected CommunicationService $service) {}

    public function created(Model $model): void
    {
        $type = $this->determineChannelType($model);
        if ($type) {
            $this->service->getOrCreateChannelForModel($model, $type);
        }
    }

    protected function determineChannelType(Model $model): ?string
    {
        return match (get_class($model)) {
            \App\Models\Church::class => 'club',
            \App\Models\PathfinderClass::class => 'class',
            \App\Models\Unit::class => 'unit',
            \App\Models\District::class => 'district',
            \App\Models\Union::class => 'union',
            default => null,
        };
    }
}
