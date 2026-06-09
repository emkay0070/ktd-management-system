<?php

namespace App\Traits;

use App\Models\CommunicationChannel;
use App\Services\CommunicationService;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasCommunicationChannels
{
    public function channels(): MorphMany
    {
        return $this->morphMany(CommunicationChannel::class, 'model');
    }

    public function getCommunicationChannel(string $type = 'club')
    {
        return app(CommunicationService::class)->getOrCreateChannelForModel($this, $type);
    }
}
