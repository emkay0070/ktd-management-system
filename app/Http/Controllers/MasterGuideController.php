<?php

namespace App\Http\Controllers;

use App\Models\MasterGuide;
use App\Models\Religion;
use Illuminate\Http\Request;

class MasterGuideController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['club_director', 'club_secretary', 'district_director', 'super_admin']), 403);
        abort_unless($user->church_id, 403);

        $religionId = $request->religion_id;
        if ($religionId && !is_numeric($religionId)) {
            $religion = Religion::firstOrCreate(
                ['name' => $religionId, 'church_id' => $user->church_id]
            );
            $request->merge(['religion_id' => $religion->id]);
        }

        $request->validate([
            'full_name' => 'required|string|max:255',
            'role' => 'required|string|in:MG,MGT,PLA,APLA',
            'assigned_class_id' => 'nullable|integer|exists:classes,id',
            'religion_id' => 'required|integer|exists:religions,id',
            'other_religion' => 'nullable|string|max:255',
            'residence' => 'required|string|max:255',
            'occupation_status' => 'required|string|in:working,schooling,unemployed',
            'insured_yearly' => 'required|boolean',
            'actively_teaching' => 'required|boolean',
            'responsibility' => 'nullable|string|max:5000',
            'other_church_responsibility' => 'required|string|max:5000',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars/leaders', 'public');
        }

        MasterGuide::create([
            ...$request->except('avatar'),
            'avatar_path' => $avatarPath,
            'church_id' => $user->church_id,
        ]);

        return back()->with('message', 'Master Guide saved.');
    }

    public function storeBulk(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['club_director', 'club_secretary', 'district_director', 'super_admin']), 403);
        abort_unless($user->church_id, 403);

        $request->validate([
            'master_guides' => 'required|array|min:1|max:10',
            'master_guides.*.name' => 'required|string|max:255',
            'master_guides.*.phone' => 'nullable|string|max:255',
            'master_guides.*.gender' => 'required|string|in:Male,Female',
            'master_guides.*.role' => 'required|string|in:MG,MGiT',
            'master_guides.*.religion_id' => 'required|integer|exists:religions,id',
        ]);

        foreach ($request->master_guides as $mg) {
            MasterGuide::create([
                'full_name' => $mg['name'],
                'phone_number' => $mg['phone'], // Assuming db column might be phone or phone_number. Need to check what store() uses...
                'gender' => $mg['gender'],
                'role' => $mg['role'],
                'religion_id' => $mg['religion_id'],
                'church_id' => $user->church_id,
                'residence' => 'N/A', // defaults required by schema
                'occupation_status' => 'working',
                'insured_yearly' => false,
                'actively_teaching' => false,
                'other_church_responsibility' => 'none',
            ]);
        }

        return back()->with('message', count($request->master_guides) . ' Master Guides saved successfully.');
    }

    public function update(Request $request, MasterGuide $masterGuide)
    {
        $user = $request->user();
        abort_unless($user && $user->role !== 'super_admin', 403);
        abort_unless($user->church_id && $masterGuide->church_id === $user->church_id, 403);

        $religionId = $request->religion_id;
        if ($religionId && !is_numeric($religionId)) {
            $religion = Religion::firstOrCreate(
                ['name' => $religionId, 'church_id' => $user->church_id]
            );
            $request->merge(['religion_id' => $religion->id]);
        }

        $request->validate([
            'full_name' => 'required|string|max:255',
            'role' => 'required|string|in:MG,MGT,PLA,APLA',
            'assigned_class_id' => 'nullable|integer|exists:classes,id',
            'religion_id' => 'required|integer|exists:religions,id',
            'other_religion' => 'nullable|string|max:255',
            'residence' => 'required|string|max:255',
            'occupation_status' => 'required|string|in:working,schooling,unemployed',
            'insured_yearly' => 'required|boolean',
            'actively_teaching' => 'required|boolean',
            'responsibility' => 'nullable|string|max:5000',
            'other_church_responsibility' => 'required|string|max:5000',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($masterGuide->avatar_path && \Storage::disk('public')->exists($masterGuide->avatar_path)) {
                \Storage::disk('public')->delete($masterGuide->avatar_path);
            }
            $masterGuide->avatar_path = $request->file('avatar')->store('avatars/leaders', 'public');
        }

        $religion = Religion::query()->find($request->religion_id);
        if ($religion && strtolower($religion->name) === 'other' && empty($request->other_religion)) {
            return back()->withErrors(['other_religion' => 'Please specify religion when selecting Other.'])->withInput();
        }

        $masterGuide->update($request->except('avatar'));

        return back()->with('message', 'Master Guide updated.');
    }

    public function show(MasterGuide $masterGuide)
    {
        $user = auth()->user();
        abort_unless($user->church_id === $masterGuide->church_id, 403);

        return \Inertia\Inertia::render('Leader/Details', [
            'leader' => $masterGuide->load(['religion', 'assignedClass']),
        ]);
    }

    public function edit(MasterGuide $masterGuide)
    {
        $user = auth()->user();
        abort_unless($user->church_id === $masterGuide->church_id, 403);

        return \Inertia\Inertia::render('Leader/Edit', [
            'leader' => $masterGuide,
            'picklists' => [
                'religions' => Religion::all(),
                'classes' => \App\Models\PathfinderClass::all(),
            ],
        ]);
    }

    public function destroy(Request $request, MasterGuide $masterGuide)
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['club_director', 'club_secretary', 'district_director', 'super_admin']), 403);
        abort_unless($user->church_id && $masterGuide->church_id === $user->church_id, 403);

        if ($masterGuide->avatar_path) {
            \Storage::disk('public')->delete($masterGuide->avatar_path);
        }
        $masterGuide->delete();

        return back()->with('message', 'Master Guide removed.');
    }
}
