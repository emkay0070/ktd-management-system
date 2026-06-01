<?php

namespace App\Http\Controllers;

use App\Services\DashboardRouterService;

class DashboardController extends Controller
{
    public function index(DashboardRouterService $router, $section = 'overview')
    {
        return $router->dispatch(auth()->user(), $section);
    }
}
