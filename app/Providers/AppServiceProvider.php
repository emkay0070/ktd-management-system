<?php

namespace App\Providers;

use App\Models\Permission;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
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
