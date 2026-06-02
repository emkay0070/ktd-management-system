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

    protected function renderSuperAdmin(User $user, $section)
    {
        $pendingChurches = Church::where('status', 'pending_verification')->get();
        $pendingApprovals = User::whereHas('roles', fn($q) => $q->where('role_user.status', 'pending'))->with('roles')->get();

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
            'churches' => $churches,
            'pending_churches' => $pendingChurches,
            'pending_approvals' => $pendingApprovals,
            'medical_alerts' => $medicalAlerts,
        ]);
    }

    protected function renderDistrict(User $user, $section)
    {
        if ($user->hasRole('district_treasurer') && $section === 'overview') {
            $section = 'camp_registrations';
        }
        
        $district = $user->district;
        if (!$district) abort(403, 'No district assigned to this account.');

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
            ->filter(fn($u) => $u->hasAnyRole(['district_director', 'district_committee', 'district_treasurer', 'district_official']))
            ->map(fn($u) => [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
                'roles' => $u->role_names, 'avatar_url' => $u->avatar_url,
            ]);

        return Inertia::render('Dashboard/District', [
            'district' => ['id' => $district->id, 'name' => $district->name, 'conference' => $district->conference->name ?? 'Unknown'],
            'churches' => $churches,
            'committee' => $committee,
            'events' => $district->events()->orderBy('start_date', 'asc')->get(),
            'tasks' => $district->tasks()->with(['submissions.church'])->orderBy('deadline', 'asc')->get(),
            'roster' => \App\Models\MasterGuide::whereIn('church_id', $district->churches->pluck('id'))->with(['church', 'assignedClass'])->get(),
            'bulletins' => $district->bulletins()->orderBy('created_at', 'desc')->get(),
            'registrations' => \App\Models\Registration::whereIn('church_id', $district->churches->pluck('id'))->with(['pathfinder', 'church', 'event'])->latest()->get(),
            'leaderboard' => $district->churches->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'points' => (int)\App\Models\TaskSubmission::where('church_id', $c->id)->where('status', 'Approved')->sum('points_awarded')])->sortByDesc('points')->values(),
            'analytics' => ['growth' => $growthPulse, 'composition' => [], 'activity' => $activityPulse], // Composition simplified for brevity here
            'section' => $section,
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
            'district_events' => \App\Models\DistrictEvent::where('district_id', $church->district_id)->where('is_published', true)->get(),
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
            'announcements' => \App\Models\DistrictBulletin::where('is_active', true)->where('district_id', $user->church?->district_id)->latest()->get(),
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
            'bulletins' => \App\Models\DistrictBulletin::where('is_active', true)->latest()->take(5)->get(),
        ]);
    }
}
