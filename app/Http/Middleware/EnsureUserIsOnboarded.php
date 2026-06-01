<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsOnboarded
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->status === 'pending_onboarding') {
            // Prevent infinite loop if they are already on the onboarding route
            if (!$request->routeIs('onboarding.*') && !$request->routeIs('logout')) {
                return redirect()->route('onboarding.index');
            }
        }

        return $next($request);
    }
}
