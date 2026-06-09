<?php

namespace App\Http\Controllers;

use App\Models\MasterGuide;
use App\Models\Religion;
use App\Models\StaffCredential;
use App\Models\PathfinderClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MasterGuideController extends Controller
{
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['director', 'district_director', 'super_admin']), 403);
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
            'role' => 'required|string|in:MG,MGT', // Investiture status: Master Guide or Master Guide in Training
            'investiture_status' => 'nullable|string|in:in_training,certified,unknown,not_applicable',
            'master_guide_level' => 'nullable|string|max:255',
            'training_started_at' => 'nullable|date',
            'training_completed_at' => 'nullable|date',
            'investiture_date' => 'nullable|date',
            'is_active_in_club' => 'nullable|boolean',
            'can_serve_as_staff' => 'nullable|boolean',
            'assigned_class_id' => 'nullable|integer|exists:classes,id',
            'religion_id' => 'required|integer|exists:religions,id',
            'other_religion' => 'nullable|string|max:255',
            'residence' => 'nullable|string|max:255',
            'occupation_status' => 'required|string|in:working,schooling,unemployed',
            'insured_yearly' => 'required|boolean',
            'actively_teaching' => 'required|boolean',
            'responsibility' => 'nullable|string|max:5000',
            'other_church_responsibility' => 'nullable|string|max:5000',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars/leaders', 'public');
        }

        // Set default investiture_status based on role if not provided
        $investitureStatus = $request->investiture_status;
        if (!$investitureStatus) {
            $investitureStatus = ($request->role === 'MG') ? 'certified' : 'in_training';
        }

        $mg = MasterGuide::create([
            ...$request->except('avatar'),
            'avatar_path' => $avatarPath,
            'church_id' => $user->church_id,
            'status' => 'active', // Manually registered by director = active staff
            'investiture_status' => $investitureStatus,
            'master_guide_level' => $request->master_guide_level ?? $request->role,
            'onboarding_source' => 'manual_admin',
            'is_active_in_club' => $request->is_active_in_club ?? true,
            'can_serve_as_staff' => $request->can_serve_as_staff ?? true,
        ]);

        if ($mg->role === 'MG') {
            StaffCredential::firstOrCreate([
                'staff_id' => $mg->id,
                'credential_type' => 'master_guide',
            ], [
                'status' => StaffCredential::STATUS_CERTIFIED,
                'notes' => 'Recorded during manual registration',
            ]);
        }

        return back()->with('message', 'Master Guide saved.');
    }

    public function storeBulk(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['director', 'district_director', 'super_admin']), 403);
        abort_unless($user->church_id, 403);

        $request->validate([
            'master_guides' => 'required|array|min:1|max:10',
            'master_guides.*.name' => 'required|string|max:255',
            'master_guides.*.role' => 'required|string|in:MG,MGT',
            'master_guides.*.religion_id' => 'required|integer|exists:religions,id',
            'master_guides.*.avatar' => 'nullable|image|max:2048',
        ]);

        foreach ($request->master_guides as $index => $mg) {
            $avatarPath = null;
            if ($request->hasFile("master_guides.{$index}.avatar")) {
                $avatarPath = $request->file("master_guides.{$index}.avatar")->store('avatars/leaders', 'public');
            }

            $mgModel = MasterGuide::create([
                'full_name' => $mg['name'],
                'role' => $mg['role'],
                'religion_id' => $mg['religion_id'],
                'church_id' => $user->church_id,
                'status' => 'active', // Manually registered = active staff
                'investiture_status' => ($mg['role'] === 'MG') ? 'certified' : 'in_training',
                'master_guide_level' => $mg['role'],
                'onboarding_source' => 'bulk_import',
                'is_active_in_club' => true,
                'can_serve_as_staff' => true,
                'residence' => 'N/A', // defaults required by schema
                'occupation_status' => 'working',
                'insured_yearly' => false,
                'actively_teaching' => false,
                'other_church_responsibility' => 'none',
                'avatar_path' => $avatarPath,
            ]);

            if ($mgModel->role === 'MG') {
                StaffCredential::firstOrCreate([
                    'staff_id' => $mgModel->id,
                    'credential_type' => 'master_guide',
                ], [
                    'status' => StaffCredential::STATUS_CERTIFIED,
                    'notes' => 'Recorded during bulk registration',
                ]);
            }
        }

        return back()->with('message', count($request->master_guides) . ' Master Guides saved successfully.');
    }

    public function update(Request $request, MasterGuide $masterGuide)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user && !$user->hasRole('super_admin'), 403);
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
            'role' => 'required|string|in:MG,MGT', // Investiture status: Master Guide or Master Guide in Training
            'investiture_status' => 'nullable|string|in:in_training,certified,unknown,not_applicable',
            'master_guide_level' => 'nullable|string|max:255',
            'training_started_at' => 'nullable|date',
            'training_completed_at' => 'nullable|date',
            'investiture_date' => 'nullable|date',
            'is_active_in_club' => 'nullable|boolean',
            'can_serve_as_staff' => 'nullable|boolean',
            'assigned_class_id' => 'nullable|integer|exists:classes,id',
            'religion_id' => 'required|integer|exists:religions,id',
            'other_religion' => 'nullable|string|max:255',
            'residence' => 'nullable|string|max:255',
            'occupation_status' => 'required|string|in:working,schooling,unemployed',
            'insured_yearly' => 'required|boolean',
            'actively_teaching' => 'required|boolean',
            'responsibility' => 'nullable|string|max:5000',
            'other_church_responsibility' => 'nullable|string|max:5000',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($masterGuide->avatar_path && Storage::disk('public')->exists($masterGuide->avatar_path)) {
                Storage::disk('public')->delete($masterGuide->avatar_path);
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

    public function show(Request $request, MasterGuide $masterGuide)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->church_id === $masterGuide->church_id, 403);

        return \Inertia\Inertia::render('Leader/Details', [
            'leader' => $masterGuide->load(['religion', 'assignedClass']),
        ]);
    }

    public function edit(Request $request, MasterGuide $masterGuide)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->church_id === $masterGuide->church_id, 403);

        return \Inertia\Inertia::render('Leader/Edit', [
            'leader' => $masterGuide,
            'picklists' => [
                'religions' => Religion::all(),
                'classes' => PathfinderClass::all(),
            ],
        ]);
    }

    public function destroy(Request $request, MasterGuide $masterGuide)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['director', 'district_director', 'super_admin']), 403);
        abort_unless($user->church_id && $masterGuide->church_id === $user->church_id, 403);

        if ($masterGuide->avatar_path) {
            Storage::disk('public')->delete($masterGuide->avatar_path);
        }
        $masterGuide->delete();

        return back()->with('message', 'Master Guide removed.');
    }
}
