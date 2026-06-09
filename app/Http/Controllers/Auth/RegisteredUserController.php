<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Church;
use App\Models\District;
use App\Models\ParentProfile;
use App\Models\Pathfinder;
use App\Models\PendingParentLink;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(?string $intent = null): Response
    {
        $validIntents = ['pathfinder', 'parent', 'leader', 'district', 'master_guide'];
        if ($intent && !in_array($intent, $validIntents)) {
            return redirect()->route('register');
        }

        return Inertia::render('Auth/Register', [
            'intent' => $intent,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:director,pathfinder,master_guide,parent,observer,' . implode(',', User::getAllDistrictRoles()),
            'union_id' => 'nullable|exists:unions,id',
            'conference_id' => 'nullable|exists:conferences,id',
            'zone_id' => 'nullable|exists:zones,id',
            'district_id' => 'nullable|exists:districts,id',
            'church_id' => 'nullable|exists:churches,id',
            'new_church_name' => 'nullable|string|max:255',
            'is_master_guide' => 'nullable|boolean',
            'club_role' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $churchId = $request->church_id;

        // Create new church if requested (Status: pending_verification)
        if (!$churchId && $request->new_church_name) {
            $church = Church::create([
                'name' => $request->new_church_name,
                'district_id' => $request->district_id,
                'status' => 'pending_verification',
            ]);
            $churchId = $church->id;
        }

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        // 1. Create Identity
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => 'pending_onboarding', // Identity needs onboarding
            'church_id' => $churchId,
            'district_id' => $request->district_id,
            'avatar_path' => $avatarPath,
        ]);

        // 2. Assign Default Role (Observer)
        $observerRole = Role::where('name', 'observer')->first();
        if ($observerRole) {
            $user->roles()->attach($observerRole->id, ['status' => 'active']);
        }

        // 3. Assign Intent Role
        $intentRole = Role::where('name', $request->role)->first();
        if ($intentRole && $request->role !== 'observer') {
            $isDistrictRole = in_array($request->role, User::getAllDistrictRoles());
            $roleStatus = ($request->role === 'director' || $isDistrictRole) ? 'pending' : 'active';
            
            $pivotData = ['status' => $roleStatus];
            
            // Scope assignment
            if ($isDistrictRole && $request->district_id) {
                $pivotData['entity_type'] = District::class;
                $pivotData['entity_id'] = $request->district_id;
            } elseif ($request->role === 'director' && $request->church_id) {
                $pivotData['entity_type'] = Church::class;
                $pivotData['entity_id'] = $request->church_id;
            }

            $user->roles()->attach($intentRole->id, $pivotData);
        }

        // 4. Role-specific profile initialization
        if ($request->role === 'parent') {
            ParentProfile::create([
                'user_id' => $user->id,
                'is_master_guide' => $request->is_master_guide ?? false,
                'club_role' => $request->club_role,
            ]);

            // Automatic Linking Logic
            $potentialChildren = Pathfinder::query()
                ->where('father_name', 'ILIKE', $user->name)
                ->orWhere('mother_name', 'ILIKE', $user->name)
                ->orWhere('guardian_name', 'ILIKE', $user->name)
                ->get();

            foreach ($potentialChildren as $child) {
                PendingParentLink::create([
                    'user_id' => $user->id,
                    'pathfinder_id' => $child->id,
                    'status' => 'pending',
                ]);
            }
        }

        event(new Registered($user));
        Auth::login($user);

        return redirect(route('onboarding.index'));
    }
}
