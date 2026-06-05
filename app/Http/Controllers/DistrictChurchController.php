<?php

namespace App\Http\Controllers;

use App\Models\Church;
use Illuminate\Http\Request;

class DistrictChurchController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'is_school' => 'boolean'
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        if (!$user->district_id) {
            return back()->with('error', 'You must belong to a district to add a club.');
        }

        Church::create([
            'name' => $request->name,
            'location' => $request->location,
            'district_id' => $user->district_id,
            'status' => 'approved', // District leaders directly approve the churches they add
            'is_school' => $request->boolean('is_school'),
        ]);

        return back()->with('success', 'Club registered successfully.');
    }
}
