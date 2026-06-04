<?php

namespace App\Services;

use App\Models\Church;
use App\Models\Pathfinder;
use App\Models\User;
use Inertia\Inertia;

class DashboardRouterService
{
    protected ClubCommandCenterService $clubService;

    public function __construct(ClubCommandCenterService $clubService)
    {
        $this->clubService = $clubService;
    }

    public function dispatch(User $user, string $section = 'overview')
    {
        if ($user->status === 'pending_onboarding') {
            $pendingRoles = $user->roles()->wherePivot('status', 'pending')->pluck('name')->toArray();
            $activeRoles  = $user->roles()->wherePivot('status', 'active')->pluck('name')->toArray();
            $allRoles     = array_merge($pendingRoles, $activeRoles);

            $hasLinkedChild = false;
            if (in_array('parent', $allRoles)) {
                $hasLinkedChild = $user->children()->exists() || $user->pendingLinks()->exists();
            }

            $needsSetup = !$user->hasRole('super_admin') && (
                (empty($activeRoles) && empty($pendingRoles)) ||
                (in_array('parent', $activeRoles) && !$hasLinkedChild) ||
                (!$user->church_id && empty(array_intersect(['district_official', 'district_director', 'district_treasurer', 'district_secretary', 'district_committee', 'district_curriculum_coordinator', 'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 'district_pbe_coordinator', 'district_programs_coordinator'], $allRoles)))
            );

            if ($needsSetup) {
                if (!str_starts_with($section, 'setup')) {
                    $step = $this->getNextIncompleteStep($user, $pendingRoles, $activeRoles, $hasLinkedChild);
                    session()->flash('warning', 'Your account setup is not yet complete. Please finish the step below to continue.');
                    return redirect()->route('dashboard', ['section' => "setup-{$step}"]);
                }

                return Inertia::render('Dashboard/SetupWizard', [
                    'user'  => $user->only('id', 'name', 'email', 'church_id'),
                    'roles' => \App\Models\Role::where('name', '!=', 'super_admin')->get(),
                    'state' => [
                        'pending_roles'    => $pendingRoles,
                        'active_roles'     => $activeRoles,
                        'has_church'       => (bool) $user->church_id,
                        'has_linked_child' => $hasLinkedChild,
                    ]
                ]);
            }
        }

        // 1.5 Pending Leadership Role "Waiting Room"
        $pendingRoles = $user->roles()->wherePivot('status', 'pending')->pluck('name')->toArray();
        $pendingDistrictRoles = array_intersect(['district_official', 'district_director', 'district_treasurer', 'district_secretary', 'district_committee', 'district_curriculum_coordinator', 'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 'district_pbe_coordinator', 'district_programs_coordinator'], $pendingRoles);
        if (count($pendingDistrictRoles) > 0 || in_array('director', $pendingRoles)) {
            if ($section !== 'onboarding-waiting') {
                session()->flash('warning', 'Your account setup is not yet complete. Please finish the step below to continue.');
                return redirect()->route('dashboard', ['section' => 'onboarding-waiting']);
            }
            $pendingRole = count($pendingDistrictRoles) > 0 ? reset($pendingDistrictRoles) : 'director';
            return Inertia::render('Onboarding/Index', [
                'role' => $pendingRole,
                'church_status' => $user->church ? $user->church->status : null,
                'church_name' => $user->church ? $user->church->name : null,
            ]);
        }

        $context = $user->active_context;

        // 2. Route by explicit context rather than highest possible permission
        return match ($context) {
            'super_admin'       => $this->renderSuperAdmin($user, $section),
            'district_official' => $this->renderDistrict($user, $section),
            'district_director' => $this->renderDistrict($user, $section),
            'district_treasurer'=> $this->renderDistrict($user, $section),
            'district_committee'=> $this->renderDistrict($user, $section),
            'director'          => $this->renderDirector($user, $section),
            'master_guide'      => $this->renderMasterGuide($user, $section),
            'parent'            => $this->renderParent($user, $section),
            'pathfinder'        => $this->renderPathfinder($user, $section),
            default             => $this->renderObserver($user, $section),
        };
    }

    protected function getNextIncompleteStep(User $user, array $pendingRoles, array $activeRoles, bool $hasLinkedChild): string
    {
        $allRoles = array_merge($pendingRoles, $activeRoles);
        if (empty($allRoles)) return 'role';

        $activeNonObserverRoles = array_filter($activeRoles, fn($r) => $r !== 'observer');
        if (count($pendingRoles) > 0 && count($activeNonObserverRoles) === 0) return 'approval';

        if (in_array('parent', $allRoles) && !$hasLinkedChild) return 'link-child';

        if (!$user->church_id && empty(array_intersect(['district_official', 'district_director', 'district_treasurer', 'district_secretary', 'district_committee', 'district_curriculum_coordinator', 'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 'district_pbe_coordinator', 'district_programs_coordinator'], $allRoles))) return 'organization';

        return 'finish';
    }

    protected function renderSuperAdmin(User $user, $section)
    {
        if ($section === 'directors') {
            $districts = \App\Models\District::with(['conference', 'churches.pathfinders'])
                ->withCount('churches')
                ->get()
                ->map(function ($d) {
                    // Manual sum because nested counts via withCount are tricky
                    $total_pathfinders = 0;
                    foreach ($d->churches as $church) {
                        $total_pathfinders += $church->pathfinders->count();
                    }
                    
                    // Find the assigned director for this district
                    $director = \App\Models\User::whereHas('roles', function($q) {
                        $q->where('name', 'district_director')->where('role_user.status', 'active');
                    })->where('district_id', $d->id)->first();

                    return [
                        'id' => $d->id,
                        'name' => $d->name,
                        'conference' => $d->conference->name ?? 'Unknown',
                        'churches_count' => $d->churches_count,
                        'total_pathfinders' => $total_pathfinders,
                        'director' => $director ? $director->only(['id', 'name', 'email', 'avatar_url']) : null,
                    ];
                });

            // All eligible users for assigning a director (anyone not already a director of another district)
            $eligible_users = \App\Models\User::query()
                ->select(['id', 'name', 'email', 'district_id'])
                ->orderBy('name')
                ->get();
                
            $unassigned_directors = \App\Models\User::whereHas('roles', function($q) {
                $q->where('name', 'district_director')->where('role_user.status', 'active');
            })->whereNull('district_id')->get()->map(fn($user) => $user->only(['id', 'name', 'email']));

            return Inertia::render('Dashboard/SuperAdmin', [
                'section' => 'directors',
                'districts' => $districts,
                'eligible_users' => $eligible_users,
                'conferences' => \App\Models\Conference::all(['id', 'name']),
                'unassigned_directors' => $unassigned_directors,
            ]);
        }

        $pendingChurches = Church::where('status', 'pending_verification')->get();
        $pendingApprovals = User::whereHas('roles', fn($q) => $q->where('role_user.status', 'pending'))
            ->with(['roles', 'church', 'district'])
            ->get();

        $medicalAlerts = Pathfinder::whereNotNull('medical_conditions')
            ->where('medical_conditions', '!=', '')
            ->where('medical_conditions', 'not ilike', 'none')
            ->where('medical_conditions', 'not ilike', 'n/a')
            ->with('church:id,name')
            ->get(['id', 'name', 'church_id', 'medical_conditions']);

        $churches = Church::query()
            ->where('status', 'approved')
            ->withCount([
                'pathfinders as total_pathfinders',
                'pathfinders as medical_flags' => fn($q) => $q->whereNotNull('medical_conditions')->where('medical_conditions', '!=', ''),
                'masterGuides as total_master_guides',
                'masterGuides as total_mgit' => fn($q) => $q->where('role', 'MGiT'),
                'units as total_units',
            ])
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'location' => $c->location,
                'total' => (int) $c->total_pathfinders,
                'medical' => (int) $c->medical_flags,
                'master_guides' => (int) $c->total_master_guides,
                'mgit' => (int) $c->total_mgit,
                'units' => (int) $c->total_units,
                'status' => ((int) $c->total_pathfinders) > 0 ? 'active' : 'pending',
            ]);

        return Inertia::render('Dashboard/SuperAdmin', [
            'section' => $section,
            'churches' => $churches,
            'pending_churches' => $pendingChurches,
            'pending_approvals' => $pendingApprovals,
            'medical_alerts' => $medicalAlerts,
        ]);
    }

    protected function renderDistrict(User $user, $section)
    {
        // Route coordinators to their default workspace when they land on 'overview'
        if ($section === 'overview') {
            if ($user->hasRole('district_treasurer') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'camp_registrations';
            } elseif ($user->hasRole('district_curriculum_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'curriculum';
            } elseif ($user->hasRole('district_communication_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'bulletins';
            } elseif ($user->hasRole('district_programs_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'events';
            } elseif ($user->hasRole('district_music_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'overview'; // Music department workspace coming in Phase 2
            } elseif ($user->hasRole('district_pbe_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'overview'; // PBE department workspace coming in Phase 2
            } elseif ($user->hasRole('district_welfare_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'overview'; // Welfare department workspace coming in Phase 2
            }
        }
        
        $district = $user->district;
        if (!$district) {
            // Approved district official but no district linked — show a helpful message
            // instead of redirecting to onboarding (which would create an infinite loop
            // since OnboardingController redirects active users back to dashboard).
            return Inertia::render('Dashboard/Observer', [
                'user' => $user->only('id', 'name', 'email'),
                'bulletins' => collect(),
                'error_message' => 'Your district official role has been approved, but your account is not yet linked to a district. Please contact your Conference Administrator to assign you to a district.',
            ]);
        }

        $churches = Church::query()
            ->where('district_id', $district->id)
            ->withCount([
                'pathfinders as total_pathfinders',
                'masterGuides as total_master_guides',
                'masterGuides as total_mgt' => fn($q) => $q->whereIn('role', ['MGT', 'MGiT']),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id, 'name' => $c->name, 'location' => $c->location,
                'total' => (int) $c->total_pathfinders, 'master_guides' => (int) $c->total_master_guides,
                'mgt' => (int) $c->total_mgt, 'status' => ((int) $c->total_pathfinders) > 0 ? 'active' : 'pending',
            ]);

        // Growth Pulse Logic
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months->push(['month' => $date->format('M'), 'key' => $date->format('Y-m'), 'count' => 0]);
        }
        $regData = Pathfinder::whereIn('church_id', $district->churches->pluck('id'))->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("to_char(created_at, 'YYYY-MM') as month_key, count(*) as count")
            ->groupBy('month_key')->pluck('count', 'month_key');
        
        $growthPulse = $months->map(fn($m) => ['label' => $m['month'], 'value' => (int)($regData[$m['key']] ?? 0)]);

        $activityPulse = \App\Models\TaskSubmission::whereIn('church_id', $district->churches->pluck('id'))
            ->where('created_at', '>=', now()->subMonths(3))->selectRaw("to_char(created_at, 'YYYY-MM-DD') as day, count(*) as count")
            ->groupBy('day')->orderBy('day', 'asc')->get();

        $committee = $district->users()->get()
            ->filter(fn($u) => $u->hasAnyRole(['district_director', 'district_committee', 'district_treasurer', 'district_secretary', 'district_official', 'district_curriculum_coordinator', 'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 'district_pbe_coordinator', 'district_programs_coordinator']))
            ->map(fn($u) => [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
                'roles' => $u->role_names, 'avatar_url' => $u->avatar_url,
            ]);

        $inviteLinks = [
            'treasurer' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_treasurer', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'secretary' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_secretary', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'committee' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_committee', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'curriculum' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_curriculum_coordinator', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'communication' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_communication_coordinator', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'music' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_music_coordinator', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'welfare' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_welfare_coordinator', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'pbe' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_pbe_coordinator', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'programs' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_programs_coordinator', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
        ];

        $pendingChurches = Church::where('district_id', $district->id)->whereIn('status', ['pending', 'pending_verification'])->get();
        $pendingApprovals = User::whereHas('roles', fn($q) => $q->where('role_user.status', 'pending'))
            ->where(function ($q) use ($district) {
                $q->where('district_id', $district->id)
                  ->orWhereHas('church', fn($q2) => $q2->where('district_id', $district->id));
            })
            ->with(['roles', 'church', 'district'])
            ->get();

        $permissions = [
            'view_all' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']),
            'edit_curriculum' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_curriculum_coordinator']),
            'edit_communication' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_communication_coordinator']),
            'edit_programs' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_programs_coordinator']),
            'edit_music' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_music_coordinator']),
            'edit_treasury' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_treasurer']),
            'edit_pbe' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_pbe_coordinator']),
            'edit_welfare' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_welfare_coordinator']),
        ];

        $curriculumStats = [];
        foreach ($district->churches as $church) {
            $stats = ['Friend' => 0, 'Companion' => 0, 'Explorer' => 0, 'Ranger' => 0, 'Voyager' => 0, 'Guide' => 0, 'Ready' => 0];
            $pathfinders = \App\Models\Pathfinder::where('church_id', $church->id)->with('assignedClass')->get();
            foreach ($pathfinders as $pf) {
                if ($pf->assignedClass) {
                    $className = $pf->assignedClass->name;
                    if (isset($stats[$className])) {
                        $stats[$className]++;
                    }
                    // TODO: Implement actual 'Ready for Investiture' logic based on CurriculumProgress
                }
            }
            $curriculumStats[] = [
                'church' => ['id' => $church->id, 'name' => $church->name],
                'stats' => $stats,
            ];
        }

        return Inertia::render('Dashboard/District', [
            'district' => ['id' => $district->id, 'name' => $district->name, 'conference' => $district->conference->name ?? 'Unknown'],
            'churches' => $churches,
            'committee' => $committee->values(),
            'invite_links' => $inviteLinks,
            'events' => $district->events()->orderBy('start_date', 'asc')->get(),
            'tasks' => $district->tasks()->with(['submissions.church'])->orderBy('deadline', 'asc')->get(),
            'roster' => \App\Models\MasterGuide::whereIn('church_id', $district->churches->pluck('id'))->with(['church', 'assignedClass'])->get(),
            'resources' => \App\Models\DistrictResource::where('district_id', $district->id)->latest()->get(),
            'bulletins' => $district->bulletins()->orderBy('created_at', 'desc')->get(),
            'registrations' => \App\Models\Registration::whereIn('church_id', $district->churches->pluck('id'))->with(['pathfinder', 'church', 'event'])->latest()->get(),
            'treasury' => [], // Add proper treasury logic here later if needed
            'leaderboard' => $district->churches->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'points' => (int)\App\Models\TaskSubmission::where('church_id', $c->id)->where('status', 'Approved')->sum('points_awarded')])->sortByDesc('points')->values(),
            'analytics' => ['growth' => $growthPulse, 'composition' => [], 'activity' => $activityPulse], // Composition simplified for brevity here
            'section' => $section,
            'pending_churches' => $pendingChurches,
            'pending_approvals' => $pendingApprovals,
            'permissions' => $permissions,
            'curriculum_stats' => $curriculumStats,
        ]);
    }

    protected function renderDirector(User $user, $section)
    {
        $church = $user->church;
        if (!$church) return Inertia::render('Dashboard/Director', ['club' => null]);

        $pathfinders = Pathfinder::where('church_id', $church->id)->orderBy('name', 'asc')->get();
        
        return Inertia::render('Dashboard/Director', [
            'club' => $this->clubService->buildForChurch($church),
            'registrations' => \App\Models\Registration::where('church_id', $church->id)->with(['pathfinder', 'event'])->get(),
            'district_tasks' => \App\Models\DistrictTask::where('district_id', $church->district_id)->orderBy('deadline', 'asc')->get(),
            'district_events' => \App\Models\DistrictEvent::where('district_id', $church->district_id)->where('is_published', true)->get(),
            'district_resources' => \App\Models\DistrictResource::where('district_id', $church->district_id)->latest()->get(),
            'district_bulletins' => \App\Models\DistrictBulletin::where('district_id', $church->district_id)->where('is_active', true)->get(),
            'parent_link_requests' => \App\Models\PendingParentLink::whereIn('pathfinder_id', $pathfinders->pluck('id'))->where('status', 'pending')->with(['user', 'pathfinder'])->get(),
            'parents' => User::where('church_id', $church->id)->get()->filter(fn($u) => $u->hasRole('parent'))->values(),
            'section' => $section,
        ]);
    }

    protected function renderMasterGuide(User $user, $section)
    {
        $profile = $user->masterGuide()->with(['church', 'assignedClass', 'trainings'])->first();
        
        $roster = collect();
        $curriculum = collect();
        
        if ($profile && $profile->assigned_class_id && $profile->church_id) {
            $roster = \App\Models\Pathfinder::where('church_id', $profile->church_id)
                ->whereHas('classAssignment', function($q) use ($profile) {
                    $q->where('class_id', $profile->assigned_class_id);
                })
                ->with(['unitMembership.unit', 'progress.requirement'])
                ->orderBy('name')
                ->get();
                
            $curriculum = \App\Models\CurriculumRequirement::where('class_id', $profile->assigned_class_id)
                ->orderBy('category')
                ->get();
        }

        return Inertia::render('Dashboard/MasterGuide', [
            'profile' => $profile,
            'tasks' => \App\Models\DistrictTask::where('district_id', $user->church?->district_id)->get(),
            'roster' => $roster,
            'curriculum' => $curriculum,
        ]);
    }

    protected function renderPathfinder(User $user, $section)
    {
        $profile = $user->pathfinder()->with(['assignedClass', 'unit', 'church', 'progress.requirement'])->first();
        
        $curriculum = collect();
        if ($profile && $profile->classAssignment) {
            $curriculum = \App\Models\CurriculumRequirement::where('class_id', $profile->classAssignment->class_id)
                ->orderBy('category')
                ->get();
        }

        return Inertia::render('Dashboard/Pathfinder', [
            'profile' => $profile,
            'announcements' => \App\Models\DistrictBulletin::where('is_active', \DB::raw('true'))->where('district_id', $user->church?->district_id)->latest()->get(),
            'curriculum' => $curriculum,
        ]);
    }

    protected function renderParent(User $user, $section)
    {
        return Inertia::render('Dashboard/Parent', [
            'profile' => $user->parentProfile,
            'children' => $user->children()->with(['assignedClass', 'unit', 'registrations.event'])->get(),
            'requests' => $user->pendingLinks()->with('pathfinder')->get(),
        ]);
    }

    protected function renderObserver(User $user, $section)
    {
        return Inertia::render('Dashboard/Observer', [
            'user' => $user->only('id', 'name', 'email'),
            'bulletins' => \App\Models\DistrictBulletin::where('is_active', \DB::raw('true'))->latest()->take(5)->get(),
        ]);
    }
}
