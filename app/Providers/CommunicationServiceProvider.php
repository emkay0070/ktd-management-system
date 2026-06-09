<?php

namespace App\Providers;

use App\Models\Church;
use App\Models\District;
use App\Models\PathfinderClass;
use App\Models\Union;
use App\Models\Unit;
use App\Observers\CommunicationModelObserver;
use App\Services\CommunicationService;
use Illuminate\Support\ServiceProvider;

class CommunicationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(CommunicationService::class, function ($app) {
            return new CommunicationService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Church::observe(CommunicationModelObserver::class);
        PathfinderClass::observe(CommunicationModelObserver::class);
        Unit::observe(CommunicationModelObserver::class);
        District::observe(CommunicationModelObserver::class);
        Union::observe(CommunicationModelObserver::class);
    }
}
