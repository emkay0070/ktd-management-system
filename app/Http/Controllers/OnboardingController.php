<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Models\Pathfinder;
use App\Models\MasterGuide;
use App\Models\PendingParentLink;
use App\Models\Role;
use App\Models\Church;
use App\Models\PathfinderClass;
use App\Models\ClassAssignment;
use App\Models\StaffCredential;
use Carbon\Carbon;

class OnboardingController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->status === 'active') {
            return redirect()->route('dashboard');
        }

        // Determine the intent role to show appropriate onboarding
        $intentRole = $user->roles()->wherePivot('status', '!=', 'revoked')->orderBy('roles.id', 'desc')->first();
        $roleName = $intentRole ? $intentRole->name : 'observer';

        return Inertia::render('Onboarding/Index', [
            'role' => $roleName,
            'church_status' => $user->church ? $user->church->status : null,
            'church_name' => $user->church ? $user->church->name : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        // Handle church selection / creation if provided
        if ($request->filled('new_church_name') && $request->filled('district_id')) {
            $church = Church::create([
                'name' => $request->new_church_name,
                'district_id' => $request->district_id,
                'status' => 'pending_verification'
            ]);
            $user->church_id = $church->id;
            $user->save();
        } elseif ($request->filled('church_id')) {
            $user->church_id = $request->church_id;
            $user->save();
        }

        // Handle role intent if provided
        if ($request->filled('intent')) {
            $role = Role::where('name', $request->intent)->first();
            if ($role) {
                // Remove existing pending roles
                $user->roles()->wherePivot('status', 'pending')->detach();
                // Attach new intent
                $user->roles()->attach($role->id, ['status' => 'pending']);
            }
        }

        $intentRole = $user->roles()->wherePivot('status', '!=', 'revoked')->first();
        $roleName = $intentRole ? $intentRole->name : 'observer';

        if ($roleName === 'pathfinder') {
            $request->validate([
                'dob' => 'required|date',
                'gender' => 'required|in:Male,Female',
                'current_class' => 'required|string',
            ]);

            $dob = Carbon::parse($request->dob);
            $age = $dob->age;

            $pathfinder = Pathfinder::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'church_id' => $user->church_id,
                'age' => $age,
                'gender' => $request->gender,
                // Additional pathfinder fields...
            ]);

            $class = PathfinderClass::firstOrCreate(['name' => $request->current_class]);
            ClassAssignment::create([
                'pathfinder_id' => $pathfinder->id,
                'class_id' => $class->id,
            ]);

            $user->status = 'active';
            $user->save();
        } elseif ($roleName === 'parent') {
            $request->validate([
                'children_names' => 'nullable|string',
            ]);
            
            // Pending links logic is handled during registration, but they can add more here.
            
            $user->status = 'active';
            $user->save();
        } elseif ($roleName === 'master_guide') {
            $request->validate([
                'investiture_year' => 'nullable|integer',
                'mg_status' => 'nullable|string|in:MG,MGT',
            ]);

            $mg = MasterGuide::create([
                'user_id' => $user->id,
                'full_name' => $user->name,
                'role' => $request->mg_status ?? 'MGT',
                'status' => 'unassigned', // Transitional: they are MGs but not yet assigned as club staff
                'investiture_status' => ($request->mg_status === 'MG') ? 'certified' : 'in_training',
                'master_guide_level' => $request->mg_status ?? 'MGT',
                'onboarding_source' => 'self_registration',
                'is_active_in_club' => false, // Not active in club yet until assigned
                'can_serve_as_staff' => true,
                'actively_teaching' => false, // Not teaching until assigned to a class
                'church_id' => $user->church_id,
                'investiture_date' => $request->investiture_year ? Carbon::createFromDate($request->investiture_year, 1, 1) : null,
            ]);

            if ($request->mg_status === 'MG') {
                StaffCredential::create([
                    'staff_id' => $mg->id,
                    'credential_type' => 'master_guide',
                    'status' => StaffCredential::STATUS_CERTIFIED,
                    'certified_at' => $request->investiture_year ? Carbon::createFromDate($request->investiture_year, 1, 1) : null,
                    'notes' => 'Self-reported during onboarding',
                ]);
            }

            $user->status = 'active';
            $user->save();
        } elseif ($roleName === 'director') {
            // Note: Since 'director' covers Club Leaders (which could be Master Guides),
            // we should also create a master guide or leader profile if needed,
            // but for now, they just acknowledge the pending state.
            $user->status = 'active'; // The identity is active, but the role pivot is 'pending'
            $user->save();
        } elseif (in_array($roleName, ['district_official'])) {
            // They just acknowledge the waiting state
            $user->status = 'active'; // The identity is active, but the role pivot is 'pending'
            $user->save();
        } else {
            $user->status = 'active';
            $user->save();
        }

        return redirect()->route('dashboard');
    }
}
