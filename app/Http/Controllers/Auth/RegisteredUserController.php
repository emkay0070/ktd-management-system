<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        $validIntents = ['pathfinder', 'parent', 'leader', 'district'];
        if ($intent && !in_array($intent, $validIntents)) {
            return redirect()->route('register');
        }

        return Inertia::render('Auth/Register', [
            'churches' => \App\Models\Church::orderBy('name')->get(['id', 'name', 'location']),
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
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:director,pathfinder,master_guide,parent,observer,district_official',
            'church_id' => 'nullable|exists:churches,id',
            'new_church_name' => 'nullable|string|max:255',
            'is_master_guide' => 'nullable|boolean',
            'club_role' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $churchId = $request->church_id;

        // Create new church if requested (Status: pending_verification)
        if (!$churchId && $request->new_church_name) {
            $church = \App\Models\Church::create([
                'name' => $request->new_church_name,
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
            'avatar_path' => $avatarPath,
        ]);

        // 2. Assign Default Role (Observer)
        $observerRole = \App\Models\Role::where('name', 'observer')->first();
        if ($observerRole) {
            $user->roles()->attach($observerRole->id, ['status' => 'active']);
        }

        // 3. Assign Intent Role
        $intentRole = \App\Models\Role::where('name', $request->role)->first();
        if ($intentRole && $request->role !== 'observer') {
            $roleStatus = in_array($request->role, ['director', 'district_official']) ? 'pending' : 'active';
            $user->roles()->attach($intentRole->id, ['status' => $roleStatus]);
        }

        // 4. Role-specific profile initialization
        if ($request->role === 'parent') {
            \App\Models\ParentProfile::create([
                'user_id' => $user->id,
                'is_master_guide' => $request->is_master_guide ?? false,
                'club_role' => $request->club_role,
            ]);

            // Automatic Linking Logic
            $potentialChildren = \App\Models\Pathfinder::query()
                ->where('father_name', 'ILIKE', $user->name)
                ->orWhere('mother_name', 'ILIKE', $user->name)
                ->orWhere('guardian_name', 'ILIKE', $user->name)
                ->get();

            foreach ($potentialChildren as $child) {
                \App\Models\PendingParentLink::create([
                    'user_id' => $user->id,
                    'pathfinder_id' => $child->id,
                    'status' => 'pending',
                ]);
            }
        }

        event(new Registered($user));
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
