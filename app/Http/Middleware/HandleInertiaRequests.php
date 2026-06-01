<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Share global props to every Inertia page.
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'role_names'       => $user->role_names,
                    'permission_names' => $user->permission_names,
                    'active_context'   => $user->active_context,
                ]) : null,
            ],

            // ── Global pending state banners ─────────────────────────────────
            'banners' => fn() => $user ? $this->buildBanners($user) : [],

            // ── Flash messages ───────────────────────────────────────────────
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
                'info'    => fn() => $request->session()->get('info'),
                'warning' => fn() => $request->session()->get('warning'),
                'message' => fn() => $request->session()->get('message'),
            ],
        ];
    }

    /**
     * Build context-aware banners for the authenticated user.
     * Returned to every page automatically — zero extra queries in controllers.
     */
    protected function buildBanners($user): array
    {
        $banners = [];

        // 1. Pending role approval
        $pendingRoles = $user->roles()
            ->wherePivot('status', 'pending')
            ->pluck('display_name')
            ->toArray();

        if (!empty($pendingRoles)) {
            $banners[] = [
                'type'    => 'info',
                'icon'    => 'clock',
                'message' => 'Your ' . implode(' & ', $pendingRoles) . ' role is awaiting district approval.',
                'action'  => null,
            ];
        }

        // 2. Observer with no other active role
        $activeRoles = $user->roles()->wherePivot('status', 'active')->pluck('name')->toArray();
        if ($activeRoles === ['observer'] || empty($activeRoles)) {
            $banners[] = [
                'type'    => 'warning',
                'icon'    => 'user',
                'message' => "You're not yet part of a club. Select your role to get started.",
                'action'  => ['label' => 'Complete Profile', 'url' => '/profile'],
            ];
        }

        // 3. No church linked
        if ($user->church_id === null && !$user->hasRole('super_admin') && !$user->hasRole('district_official')) {
            $banners[] = [
                'type'    => 'warning',
                'icon'    => 'building',
                'message' => 'Your account is not linked to a church/club yet.',
                'action'  => ['label' => 'Find a Club', 'url' => '/profile'],
            ];
        }

        return $banners;
    }
}
