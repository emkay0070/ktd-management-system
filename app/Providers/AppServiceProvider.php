<?php

namespace App\Providers;

use App\Models\Permission;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        \Illuminate\Database\Connection::resolverFor('pgsql', function ($pdo, $database, $prefix, $config) {
            return new class($pdo, $database, $prefix, $config) extends \Illuminate\Database\PostgresConnection {
                public function prepareBindings(array $bindings)
                {
                    $grammar = $this->getQueryGrammar();
                    foreach ($bindings as $key => $value) {
                        if ($value instanceof \DateTimeInterface) {
                            $bindings[$key] = $value->format($grammar->getDateFormat());
                        } elseif (is_bool($value)) {
                            $bindings[$key] = $value ? 'true' : 'false';
                        }
                    }
                    return $bindings;
                }
            };
        });
    }

    public function boot(): void
    {
        \App\Models\Pathfinder::observe(\App\Observers\PathfinderObserver::class);

        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);

        // ──────────────────────────────────────────────
        // Register every permission as a Laravel Gate.
        // Usage: $user->can('approve_church')
        //        Gate::allows('view_treasury')
        // ──────────────────────────────────────────────
        $this->registerPermissionGates();

        // Super-admin bypasses ALL gates
        Gate::before(function ($user, $ability) {
            if ($user->hasRole('super_admin')) {
                return true;
            }
        });
    }

    protected function registerPermissionGates(): void
    {
        try {
            // Avoid crashing during migrations or when tables don't exist yet
            if (!\Illuminate\Support\Facades\Schema::hasTable('permissions')) {
                return;
            }

            Permission::all()->each(function (Permission $permission) {
                Gate::define($permission->name, function ($user) use ($permission) {
                    return $user->hasPermission($permission->name);
                });
            });
        } catch (\Exception $e) {
            // Silently skip during boot if DB isn't ready
        }
    }
}
