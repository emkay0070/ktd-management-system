<?php

namespace App\Http\Controllers;

use App\Services\DashboardRouterService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardRouterService $router, $section = 'overview')
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        return $router->dispatch($user, $section);
    }
}
