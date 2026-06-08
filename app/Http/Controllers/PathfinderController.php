<?php

namespace App\Http\Controllers;

use App\Models\ClassAssignment;
use App\Models\Pathfinder;
use App\Models\Religion;
use App\Models\Unit;
use App\Models\UnitMember;
use Illuminate\Http\Request;

class PathfinderController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user && !$user->hasRole('super_admin'), 403);

        $churchId = $user->church_id;
        if (!$churchId) {
            return back()->withErrors(['name' => 'No church assigned to this director.']);
        }

        $religionId = $request->religion_id;
        if (!is_numeric($religionId)) {
            $religion = Religion::firstOrCreate(
                ['name' => $religionId, 'church_id' => $churchId]
            );
            $request->merge(['religion_id' => $religion->id]);
        }

        $religion = Religion::query()->find($request->religion_id);
        if ($religion && strtolower($religion->name) === 'other' && !$request->filled('other_religion')) {
            return back()->withErrors(['other_religion' => 'Please specify religion when selecting Other.'])->withInput();
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'father_name' => 'nullable|string|max:255|required_without_all:mother_name,guardian_name',
            'mother_name' => 'nullable|string|max:255|required_without_all:father_name,guardian_name',
            'age' => 'required|integer|min:5|max:25',
            'gender' => 'required|string|in:Male,Female',
            'guardian_name' => 'nullable|string|max:255|required_without_all:father_name,mother_name',
            'guardian_phone' => 'nullable|string|max:255',
            'boarding_status' => 'required|string|in:day,boarding',
            'medical_conditions' => 'nullable|string',
            'consent' => 'required|boolean|accepted',
            'class_id' => 'required|integer|exists:classes,id',
            'unit_id' => 'nullable|integer|exists:units,id',
            'avatar' => 'nullable|image|max:2048',
            'religion_id' => 'required|integer|exists:religions,id',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars/pathfinders', 'public');
        }

        $pathfinder = Pathfinder::create([
            'name' => $request->name,
            'father_name' => $request->father_name,
            'mother_name' => $request->mother_name,
            'age' => $request->age,
            'gender' => $request->gender,
            'guardian_name' => $request->guardian_name,
            'guardian_phone' => $request->guardian_phone,
            'religion_id' => $request->religion_id,
            'other_religion' => $request->other_religion,
            'residence' => $request->residence,
            'school_class' => $request->school_class,
            'boarding_status' => $request->boarding_status,
            'is_inducted' => (bool) $request->is_inducted,
            'insured_yearly' => (bool) $request->insured_yearly,
            'medical_conditions' => $request->medical_conditions,
            'health_conditions' => $request->medical_conditions, // backward-compat
            'consent' => (bool) $request->consent,
            'medical_consent' => (bool) $request->consent,
            'church_id' => $churchId,
            'avatar_path' => $avatarPath,
        ]);

        ClassAssignment::updateOrCreate(
            ['pathfinder_id' => $pathfinder->id],
            ['class_id' => (int) $request->class_id],
        );

        if ($request->filled('unit_id')) {
            $unit = Unit::query()->where('id', $request->unit_id)->where('church_id', $churchId)->first();
            if (!$unit) {
                return back()->withErrors(['unit_id' => 'Invalid unit for this church.']);
            }

            $expected = $unit->gender === 'boys' ? 'Male' : 'Female';
            if ($pathfinder->gender !== $expected) {
                return back()->withErrors(['unit_id' => 'Unit gender does not match Pathfinder gender.']);
            }

            UnitMember::updateOrCreate(
                ['pathfinder_id' => $pathfinder->id],
                ['unit_id' => $unit->id],
            );
        }

        return back()->with('message', 'Pathfinder saved successfully.');
    }

    public function storeBulk(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['director', 'district_director', 'super_admin']), 403);

        $churchId = $user->church_id;
        if (!$churchId) {
            return back()->withErrors(['error' => 'No church assigned to this director.']);
        }

        $request->validate([
            'pathfinders' => 'required|array|min:1|max:20',
            'pathfinders.*.name' => 'required|string|max:255',
            'pathfinders.*.age' => 'required|integer|min:5|max:25',
            'pathfinders.*.gender' => 'required|string|in:Male,Female',
            'pathfinders.*.class_id' => 'required|integer|exists:classes,id',
            'pathfinders.*.residence' => 'required|string|max:255',
            'pathfinders.*.boarding_status' => 'required|string|in:day,boarding',
            'pathfinders.*.religion_id' => 'required|integer|exists:religions,id',
            'pathfinders.*.avatar' => 'nullable|image|max:2048',
        ]);

        foreach ($request->pathfinders as $index => $pf) {
            $avatarPath = null;
            if ($request->hasFile("pathfinders.{$index}.avatar")) {
                $avatarPath = $request->file("pathfinders.{$index}.avatar")->store('avatars/pathfinders', 'public');
            }

            $pathfinder = Pathfinder::create([
                'name' => $pf['name'],
                'age' => $pf['age'],
                'gender' => $pf['gender'],
                'residence' => $pf['residence'],
                'boarding_status' => $pf['boarding_status'],
                'religion_id' => $pf['religion_id'],
                'church_id' => $churchId,
                'consent' => true,
                'medical_consent' => true,
                'is_inducted' => false,
                'insured_yearly' => false,
                'school_class' => 'N/A',
                'avatar_path' => $avatarPath,
            ]);

            ClassAssignment::create([
                'pathfinder_id' => $pathfinder->id,
                'class_id' => $pf['class_id'],
            ]);
        }

        return back()->with('message', count($request->pathfinders) . ' pathfinders saved successfully.');
    }

    public function update(Request $request, Pathfinder $pathfinder)
    {
        $user = $request->user();
        abort_unless($user && !$user->hasRole('super_admin'), 403);
        abort_unless($user->church_id && $pathfinder->church_id === $user->church_id, 403);

        $religionId = $request->religion_id;
        if (!is_numeric($religionId)) {
            $religion = Religion::firstOrCreate(
                ['name' => $religionId, 'church_id' => $user->church_id]
            );
            $request->merge(['religion_id' => $religion->id]);
        }

        $religion = Religion::query()->find($request->religion_id);
        if ($religion && strtolower($religion->name) === 'other' && !$request->filled('other_religion')) {
            return back()->withErrors(['other_religion' => 'Please specify religion when selecting Other.'])->withInput();
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'father_name' => 'nullable|string|max:255|required_without_all:mother_name,guardian_name',
            'mother_name' => 'nullable|string|max:255|required_without_all:father_name,guardian_name',
            'age' => 'required|integer|min:5|max:25',
            'gender' => 'required|string|in:Male,Female',
            'guardian_name' => 'nullable|string|max:255|required_without_all:father_name,mother_name',
            'guardian_phone' => 'nullable|string|max:255',
            'religion_id' => 'required|integer|exists:religions,id',
            'other_religion' => 'nullable|string|max:255',
            'residence' => 'required|string|max:255',
            'school_class' => 'required|string|max:255',
            'is_inducted' => 'required|boolean',
            'insured_yearly' => 'required|boolean',
            'medical_conditions' => 'nullable|string',
            'consent' => 'required|boolean',
            'class_id' => 'required|integer|exists:classes,id',
            'unit_id' => 'nullable|integer|exists:units,id',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            if ($pathfinder->avatar_path && \Storage::disk('public')->exists($pathfinder->avatar_path)) {
                \Storage::disk('public')->delete($pathfinder->avatar_path);
            }
            $pathfinder->avatar_path = $request->file('avatar')->store('avatars/pathfinders', 'public');
        }

        $pathfinder->update([
            'name' => $request->name,
            'father_name' => $request->father_name,
            'mother_name' => $request->mother_name,
            'age' => $request->age,
            'gender' => $request->gender,
            'guardian_name' => $request->guardian_name,
            'guardian_phone' => $request->guardian_phone,
            'religion_id' => $request->religion_id,
            'other_religion' => $request->other_religion,
            'residence' => $request->residence,
            'school_class' => $request->school_class,
            'boarding_status' => $request->boarding_status,
            'is_inducted' => (bool) $request->is_inducted,
            'insured_yearly' => (bool) $request->insured_yearly,
            'medical_conditions' => $request->medical_conditions,
            'health_conditions' => $request->medical_conditions,
            'consent' => (bool) $request->consent,
            'medical_consent' => (bool) $request->consent,
        ]);

        ClassAssignment::updateOrCreate(
            ['pathfinder_id' => $pathfinder->id],
            ['class_id' => (int) $request->class_id],
        );

        if ($request->filled('unit_id')) {
            $unit = Unit::query()
                ->where('id', $request->unit_id)
                ->where('church_id', $user->church_id)
                ->first();
            if (!$unit) {
                return back()->withErrors(['unit_id' => 'Invalid unit for this church.']);
            }

            $expected = $unit->gender === 'boys' ? 'Male' : 'Female';
            if ($pathfinder->gender !== $expected) {
                return back()->withErrors(['unit_id' => 'Unit gender does not match Pathfinder gender.']);
            }

            UnitMember::updateOrCreate(
                ['pathfinder_id' => $pathfinder->id],
                ['unit_id' => $unit->id],
            );
        } else {
            UnitMember::query()->where('pathfinder_id', $pathfinder->id)->delete();
        }

        return back()->with('message', 'Pathfinder updated successfully.');
    }

    public function show(Pathfinder $pathfinder)
    {
        $user = auth()->user();
        abort_unless($user->church_id === $pathfinder->church_id, 403);

        return \Inertia\Inertia::render('Pathfinder/Details', [
            'pathfinder' => $pathfinder->load(['religion', 'classAssignment.pathfinderClass', 'unitMembership.unit', 'timelineEvents']),
        ]);
    }

    public function edit(Pathfinder $pathfinder)
    {
        $user = auth()->user();
        abort_unless($user->church_id === $pathfinder->church_id, 403);

        return \Inertia\Inertia::render('Pathfinder/Edit', [
            'pathfinder' => $pathfinder->load(['classAssignment', 'unitMembership']),
            'picklists' => [
                'religions' => Religion::all(),
                'classes' => \App\Models\PathfinderClass::all(),
                'units' => \App\Models\Unit::where('church_id', $user->church_id)->get(),
            ],
        ]);
    }

    public function destroy(Request $request, Pathfinder $pathfinder)
    {
        $user = $request->user();
        abort_unless($user && !$user->hasRole('super_admin'), 403);
        abort_unless($user->church_id && $pathfinder->church_id === $user->church_id, 403);

        $pathfinder->delete();

        return back()->with('message', 'Pathfinder removed.');
    }
}
