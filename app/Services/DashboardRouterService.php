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
                (!$user->church_id && empty(array_intersect(['district_official', 'district_director', 'district_treasurer', 'district_secretary', 'district_committee', 'district_curriculum_coordinator', 'district_masterguide_coordinator', 'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 'district_pbe_coordinator', 'district_programs_coordinator'], $allRoles)))
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
        $pendingDistrictRoles = array_intersect(User::getAllDistrictRoles(), $pendingRoles);
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
        if (in_array($context, User::getAllDistrictRoles())) {
            return $this->renderDistrict($user, $section);
        }

        return match ($context) {
            'super_admin'       => $this->renderSuperAdmin($user, $section),
            'director'          => $this->renderLeadershipDashboard($user, $section),
            // master_guide context now uses the unified Leadership Dashboard
            'master_guide'      => $this->renderLeadershipDashboard($user, $section),
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

        if (!$user->church_id && empty(array_intersect(User::getAllDistrictRoles(), $allRoles))) return 'organization';

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

        $allUsers = [];
        if ($section === 'registrations') {
            $allUsers = User::with(['roles', 'church', 'district'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'roles' => $u->roles->map(fn($r) => [
                        'name' => $r->name,
                        'display_name' => $r->display_name,
                        'status' => $r->pivot->status,
                    ]),
                    'church' => $u->church ? $u->church->name : 'N/A',
                    'district' => $u->district ? $u->district->name : ($u->church?->district?->name ?? 'N/A'),
                    'status' => $u->status,
                    'created_at' => $u->created_at->toDateTimeString(),
                    'password_status' => 'Securely Hashed',
                ]);
        }

        $churches = Church::query()
            ->where('status', 'approved')
            ->withCount([
                'pathfinders as total_pathfinders',
                'pathfinders as medical_flags' => fn($q) => $q->whereNotNull('medical_conditions')->where('medical_conditions', '!=', ''),
                'masterGuides as total_master_guides' => fn($q) => $q->where('status', 'active'),
                'masterGuides as total_mgt' => fn($q) => $q->where('role', 'MGT')->where('status', 'active'),
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
                'mgt' => (int) $c->total_mgt,
                'units' => (int) $c->total_units,
                'status' => ((int) $c->total_pathfinders) > 0 ? 'active' : 'pending',
            ]);

        return Inertia::render('Dashboard/SuperAdmin', [
            'section' => $section,
            'churches' => $churches,
            'pending_churches' => $pendingChurches,
            'pending_approvals' => $pendingApprovals,
            'medical_alerts' => $medicalAlerts,
            'all_users' => $allUsers,
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
            } elseif ($user->hasRole('district_masterguide_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'masterguide';
            } elseif ($user->hasRole('district_communication_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'bulletins';
            } elseif ($user->hasRole('district_welfare_coordinator') && !$user->hasAnyRole(['district_director', 'district_secretary'])) {
                $section = 'welfare';
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
                'masterGuides as total_master_guides' => fn($q) => $q->where('status', 'active'),
                'masterGuides as total_mgt' => fn($q) => $q->where('role', 'MGT')->where('status', 'active'),
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
            ->groupByRaw("to_char(created_at, 'YYYY-MM')")
            ->pluck('count', 'month_key');
        
        $growthPulse = $months->map(fn($m) => ['label' => $m['month'], 'value' => (int)($regData[$m['key']] ?? 0)]);

        $activityPulse = \App\Models\TaskSubmission::whereIn('church_id', $district->churches->pluck('id'))
            ->where('created_at', '>=', now()->subMonths(3))
            ->selectRaw("to_char(created_at, 'YYYY-MM-DD') as submission_day, count(*) as count")
            ->groupByRaw("to_char(created_at, 'YYYY-MM-DD')")
            ->orderByRaw("to_char(created_at, 'YYYY-MM-DD') ASC")
            ->get();

        $committee = $district->users()->get()
            ->filter(fn($u) => $u->hasAnyRole(['district_director', 'district_committee', 'district_treasurer', 'district_secretary', 'district_official', 'district_curriculum_coordinator', 'district_masterguide_coordinator', 'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 'district_pbe_coordinator', 'district_programs_coordinator']))
            ->map(fn($u) => [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
                'roles' => $u->role_names, 'avatar_url' => $u->avatar_url,
            ]);

        $inviteLinks = [
            'treasurer' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_treasurer', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'secretary' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_secretary', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'committee' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_committee', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'curriculum' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_curriculum_coordinator', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
            'masterguide' => \Illuminate\Support\Facades\URL::signedRoute('invites.show', ['role' => 'district_masterguide_coordinator', 'scope_type' => \App\Models\District::class, 'scope_id' => $district->id]),
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
            'edit_masterguide' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_masterguide_coordinator']),
            
            // Communication
            'view_communication' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_communication_coordinator', 'district_programs_coordinator', 'district_curriculum_coordinator', 'district_music_coordinator', 'district_pbe_coordinator', 'district_welfare_coordinator']),
            'edit_communication' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_communication_coordinator']),
            'publish_communication' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_communication_coordinator']),
            'delete_communication' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']),
            
            // Programs (Events & Missions)
            'edit_programs' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_programs_coordinator']),
            'publish_programs' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']),
            'delete_programs' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary']),
            
            'edit_music' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_music_coordinator']),
            'edit_treasury' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_treasurer']),
            'edit_pbe' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_pbe_coordinator']),
            'edit_welfare' => $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_welfare_coordinator']),
        ];

        $curriculumStats = [];
        $districtHonoursEarned = 0;
        $honourCounts = [];

        $investitureCandidates = \App\Models\ClassAssignment::whereIn('pathfinder_id', function($q) use ($district) {
                $q->select('id')->from('pathfinders')->whereIn('church_id', $district->churches->pluck('id'));
            })
            ->whereIn('investiture_status', ['pending_review', 'recommended', 'approved'])
            ->with(['pathfinder.church', 'pathfinderClass', 'recommendedBy', 'approvedBy'])
            ->get()
            ->map(fn($ca) => [
                'id' => $ca->id,
                'pathfinder' => $ca->pathfinder->only(['id', 'name', 'gender']),
                'church' => $ca->pathfinder->church->only(['id', 'name']),
                'class' => $ca->pathfinderClass->only(['id', 'name']),
                'status' => $ca->investiture_status,
                'notes' => $ca->investiture_recommendation_notes,
                'recommended_by' => $ca->recommendedBy?->name,
                'recommended_at' => $ca->recommended_at?->toDateString(),
                'approved_by' => $ca->approvedBy?->name,
                'approved_at' => $ca->approved_at?->toDateString(),
            ]);

        $instructorStats = \App\Models\MasterGuide::whereIn('church_id', $district->churches->pluck('id'))
            ->with(['church', 'assignedClass'])
            ->get()
            ->groupBy('church_id')
            ->map(fn($mgs, $churchId) => [
                'count' => $mgs->count(),
                'active_instructors' => $mgs->where('actively_teaching', true)->count(),
                'classes_covered' => $mgs->pluck('assigned_class_id')->unique()->filter()->count(),
            ]);

        // Enhanced Health Score: Attendance Component (Last 3 months)
        $attendanceStats = \App\Models\AttendanceSession::whereIn('church_id', $district->churches->pluck('id'))
            ->where('date', '>=', now()->subMonths(3))
            ->with('records')
            ->get()
            ->groupBy('church_id')
            ->map(function ($sessions) {
                $totalPossible = 0;
                $totalPresent = 0;
                foreach ($sessions as $session) {
                    $totalPossible += $session->records->count();
                    $totalPresent += $session->records->where('is_present', true)->count();
                }
                return $totalPossible > 0 ? ($totalPresent / $totalPossible) * 100 : 0;
            });

        foreach ($district->churches as $church) {
            $stats = ['Friend' => 0, 'Companion' => 0, 'Explorer' => 0, 'Ranger' => 0, 'Voyager' => 0, 'Guide' => 0, 'Ready' => 0];
            $pathfinders = \App\Models\Pathfinder::where('church_id', $church->id)
                ->with(['classAssignment.pathfinderClass', 'honours'])
                ->get();
            
            $pfCount = $pathfinders->count();
            $churchHonours = 0;

            foreach ($pathfinders as $pf) {
                // Class Stats
                if ($pf->classAssignment && $pf->classAssignment->pathfinderClass) {
                    $className = $pf->classAssignment->pathfinderClass->name;
                    if (isset($stats[$className])) {
                        $stats[$className]++;
                    }
                    
                    if ($pf->classAssignment->investiture_status !== 'not_ready') {
                        $stats['Ready']++;
                    }
                }

                // Honour Stats
                foreach ($pf->honours as $honour) {
                    $churchHonours++;
                    $districtHonoursEarned++;
                    $honourCounts[$honour->name] = ($honourCounts[$honour->name] ?? 0) + 1;
                }
            }

            // Enhanced Health Score Calculation
            // 1. Staffing Ratio (30%) - Target 1 instructor per 8 pathfinders
            $instructors = $instructorStats[$church->id]['active_instructors'] ?? 0;
            $staffingRatio = $pfCount > 0 ? min(1, $instructors / (max(1, ceil($pfCount / 8)))) : 0;
            
            // 2. Investiture Readiness (40%)
            $readyRatio = $pfCount > 0 ? $stats['Ready'] / $pfCount : 0;
            
            // 3. Attendance Consistency (30%)
            $attendanceRatio = ($attendanceStats[$church->id] ?? 0) / 100;
            
            $healthScore = round(
                ($staffingRatio * 30) + 
                ($readyRatio * 40) + 
                ($attendanceRatio * 30)
            );

            $curriculumStats[] = [
                'church' => ['id' => $church->id, 'name' => $church->name],
                'stats' => $stats,
                'honours_earned' => $churchHonours,
                'health_score' => $healthScore,
                'attendance_avg' => round($attendanceStats[$church->id] ?? 0),
                'instructors' => $instructorStats[$church->id] ?? ['count' => 0, 'active_instructors' => 0, 'classes_covered' => 0],
            ];
        }

        arsort($honourCounts);
        $topHonours = array_slice($honourCounts, 0, 5, true);
        $topHonoursFormatted = [];
        foreach ($topHonours as $name => $count) {
            $topHonoursFormatted[] = ['name' => $name, 'count' => $count];
        }

        $allSystemHonours = \App\Models\Honour::orderBy('category')->orderBy('name')->get();
        $recentHonours = \Illuminate\Support\Facades\DB::table('pathfinder_honour')
            ->join('pathfinders', 'pathfinder_honour.pathfinder_id', '=', 'pathfinders.id')
            ->join('honours', 'pathfinder_honour.honour_id', '=', 'honours.id')
            ->join('churches', 'pathfinders.church_id', '=', 'churches.id')
            ->whereIn('churches.id', $district->churches->pluck('id'))
            ->select('pathfinders.name as pathfinder_name', 'honours.name as honour_name', 'churches.name as church_name', 'pathfinder_honour.earned_at')
            ->orderBy('pathfinder_honour.earned_at', 'desc')
            ->limit(10)
            ->get();

        $curriculumStandards = \App\Models\CurriculumStandard::where('district_id', $district->id)
            ->when(!$user->hasAnyRole(['district_director', 'district_curriculum_coordinator', 'super_admin']), function($q) {
                $q->where('workflow_status', 'published');
            })
            ->with(['creator:id,name'])
            ->latest()
            ->get();

        $cmtData = \App\Models\CmtCertification::whereHas('user', function($q) use ($district) {
            $q->whereHas('church', function($q2) use ($district) {
                $q2->where('district_id', $district->id);
            });
        })->with(['user.church', 'certifier:id,name'])->latest()->get();

        $honorCalendar = \App\Models\HonorCalendarSession::where('district_id', $district->id)
            ->with(['honour', 'instructor:id,name'])
            ->orderBy('scheduled_date', 'asc')
            ->get();

        $audits = \App\Models\CurriculumAudit::where('district_id', $district->id)
            ->with(['church:id,name', 'auditor:id,name'])
            ->orderBy('audit_date', 'desc')
            ->get();

        // Welfare & Social Data (Filtered by permissions for attendance visibility)
        $welfareCases = \App\Models\WelfareCase::where('district_id', $district->id)
            ->with(['church:id,name', 'beneficiary:id,name', 'creator:id,name'])
            ->latest()
            ->get();

        $socialEvents = \App\Models\SocialEvent::where('district_id', $district->id)
            ->with('creator:id,name')
            ->latest()
            ->get();

        // Attendance Visibility Rules:
        // Welfare and Curriculum coordinators see individual attendance records.
        // Others see club-level summaries only.
        $canSeeIndividualAttendance = $user->hasAnyRole(['super_admin', 'district_director', 'district_secretary', 'district_welfare_coordinator', 'district_curriculum_coordinator']);
        
        $inactivePathfinders = collect();
        if ($canSeeIndividualAttendance) {
            $inactivePathfinders = \App\Models\Pathfinder::whereIn('church_id', $district->churches->pluck('id'))
                ->whereDoesntHave('attendanceRecords', function($q) {
                    $q->where('created_at', '>=', now()->subDays(30));
                })
                ->with('church:id,name')
                ->get(['id', 'name', 'church_id', 'gender', 'age']);
        }

        // Declining Clubs: Compare last 30 days vs 30-60 days
        $decliningClubs = [];
        foreach ($district->churches as $church) {
            // Postgres doesn't allow AVG() on boolean columns directly
            $last30 = \App\Models\AttendanceRecord::whereHas('session', fn($q) => $q->where('church_id', $church->id)->where('date', '>=', now()->subDays(30)))
                ->selectRaw('AVG(CASE WHEN is_present THEN 1 ELSE 0 END) as aggregate')
                ->value('aggregate') ?? 0;

            $prev30 = \App\Models\AttendanceRecord::whereHas('session', fn($q) => $q->where('church_id', $church->id)->where('date', '<', now()->subDays(30))->where('date', '>=', now()->subDays(60)))
                ->selectRaw('AVG(CASE WHEN is_present THEN 1 ELSE 0 END) as aggregate')
                ->value('aggregate') ?? 0;
            
            if ($prev30 > 0 && ($last30 < $prev30 * 0.8)) { // 20% decline
                $decliningClubs[] = [
                    'id' => $church->id,
                    'name' => $church->name,
                    'last_30' => round($last30 * 100),
                    'prev_30' => round($prev30 * 100),
                    'decline' => round(($prev30 - $last30) * 100)
                ];
            }
        }

        $districtPathfinders = \App\Models\Pathfinder::whereIn('church_id', $district->churches->pluck('id'))
            ->with(['church', 'classAssignment.pathfinderClass'])
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'type' => 'pathfinder',
                'church' => $p->church?->name,
                'class' => $p->classAssignment?->pathfinderClass?->name ?? 'Unassigned',
                'status' => 'active', // For now
                'gender' => $p->gender,
                'age' => $p->age,
            ]);

        $districtMasterGuides = \App\Models\MasterGuide::whereIn('church_id', $district->churches->pluck('id'))
            ->with(['church', 'assignedClass'])
            ->get()
            ->map(fn($mg) => [
                'id' => $mg->id,
                'name' => $mg->full_name,
                'type' => 'master_guide',
                'role' => $mg->role, // MG or MGT
                'church' => $mg->church?->name,
                'class' => $mg->assignedClass?->name ?? 'None',
                'responsibility' => $mg->responsibility ?? 'Club Staff',
                'insured' => $mg->insured_yearly,
                'teaching' => $mg->actively_teaching,
            ]);

        $unifiedRoster = [
            'pathfinders' => $districtPathfinders,
            'master_guides' => $districtMasterGuides->where('role', 'MG')->values(),
            'mgt' => $districtMasterGuides->where('role', 'MGT')->values(),
        ];

        return Inertia::render('Dashboard/District', [
            'district' => ['id' => $district->id, 'name' => $district->name, 'conference' => $district->conference->name ?? 'Unknown'],
            'churches' => $churches,
            'committee' => $committee->values(),
            'invite_links' => $inviteLinks,
            'events' => $district->events()->with('approver:id,name')->orderBy('start_date', 'asc')->get(),
            'tasks' => $district->tasks()->with(['submissions.church'])->orderBy('deadline', 'asc')->get(),
            'roster' => $unifiedRoster,
            'resources' => \App\Models\DistrictResource::where('district_id', $district->id)->with('uploader:id,name')->latest()->get(),
            'bulletins' => $district->bulletins()
                ->with(['author:id,name', 'approver:id,name'])
                ->latest()
                ->get(),
            'registrations' => \App\Models\Registration::whereIn('church_id', $district->churches->pluck('id'))->with(['pathfinder', 'church', 'event'])->latest()->get(),
            'treasury' => [], // Add proper treasury logic here later if needed
            'leaderboard' => $district->churches->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'points' => (int)\App\Models\TaskSubmission::where('church_id', $c->id)->where('status', 'Approved')->sum('points_awarded')])->sortByDesc('points')->values(),
            'analytics' => ['growth' => $growthPulse, 'composition' => [], 'activity' => $activityPulse], // Composition simplified for brevity here
            'section' => $section,
            'pending_churches' => $pendingChurches,
            'pending_approvals' => $pendingApprovals,
            'permissions' => $permissions,
            'curriculum_stats' => $curriculumStats,
            'honour_analytics' => [
                'total_earned' => $districtHonoursEarned,
                'top_honours' => $topHonoursFormatted,
                'all_honours' => $allSystemHonours,
                'recent_completions' => $recentHonours,
            ],
            'investiture_candidates' => $investitureCandidates,
            'curriculum_standards' => $curriculumStandards,
            'cmt_data' => $cmtData,
            'honor_calendar' => $honorCalendar,
            'audits' => $audits,
            'district_resources' => \App\Models\DistrictResource::where('district_id', $district->id)->with('uploader:id,name')->latest()->get(),
            'growth_pulse' => $growthPulse,
            'welfare_cases' => $welfareCases,
            'social_events' => $socialEvents,
            'retention_metrics' => [
                'inactive_members' => $canSeeIndividualAttendance ? $inactivePathfinders : collect(),
                'declining_clubs' => $decliningClubs,
                'can_see_individual' => $canSeeIndividualAttendance
            ],
        ]);
    }

    /**
     * Unified Leadership Dashboard (Phase 1 Transition)
     * This replaces renderDirector and renderMasterGuide with a role-independent
     * portal that loads modules based on active assignments.
     */
    protected function renderLeadershipDashboard(User $user, $section)
    {
        $church = $user->church;
        $profile = $user->masterGuide()->with(['church', 'assignedClass', 'trainings'])->first();
        
        // --- Layer 1: Identity & Personal Growth ---
        $personalData = [
            'profile' => $profile,
            'is_mg' => $user->hasRole('master_guide') || ($profile && $profile->role === 'MG'),
            'is_mgt' => $profile && $profile->role === 'MGT',
            'trainings' => $profile ? $profile->trainings : [],
            'credentials' => $profile ? $profile->credentials : [],
        ];

        // --- Layer 2: Ministry Assignments ---
        $modules = [];

        // 1. Instructor Module
        if ($profile && $profile->assigned_class_id) {
            $modules['instructor'] = [
                'class' => $profile->assignedClass,
                'roster' => \App\Models\Pathfinder::where('church_id', $profile->church_id)
                    ->whereHas('classAssignment', function($q) use ($profile) {
                        $q->where('class_id', $profile->assigned_class_id);
                    })
                    ->with(['unitMembership.unit', 'progress.requirement'])
                    ->orderBy('name')
                    ->get(),
                'curriculum' => \App\Models\CurriculumRequirement::where('class_id', $profile->assigned_class_id)
                    ->orderBy('category')
                    ->get(),
                'resources' => \App\Models\DistrictResource::where('district_id', $church?->district_id)
                    ->where(function($q) use ($profile) {
                        $q->whereNull('category')->orWhere('category', 'Curriculum');
                    })->get(),
            ];
        }

        // 2. Counselor Module
        $unitAsCounselor = \App\Models\UnitRole::where('counselor_id', $profile?->id)->with('unit.pathfinders')->first();
        if ($unitAsCounselor) {
            $modules['counselor'] = [
                'unit' => $unitAsCounselor->unit,
                'pathfinders' => $unitAsCounselor->unit->pathfinders,
            ];
        }

        // 3. Director/Secretary Module (Oversight)
        if ($user->hasAnyRole(['director', 'secretary'])) {
            $clubChannel = app(\App\Services\CommunicationService::class)->getOrCreateChannelForModel($church, 'club');
            $modules['oversight'] = [
                'club' => $church ? $this->clubService->buildForChurch($church) : null,
                'club_channel_id' => $clubChannel->id,
                'pending_approvals' => User::whereHas('roles', fn($q) => $q->where('role_user.status', 'pending'))
                    ->where('church_id', $church?->id)
                    ->with(['roles', 'church', 'district'])
                    ->get(),
                'parent_requests' => \App\Models\PendingParentLink::whereHas('pathfinder', fn($q) => $q->where('church_id', $church?->id))
                    ->where('status', 'pending')
                    ->with(['user', 'pathfinder'])
                    ->get(),
            ];
        }

        // --- Layer 3: Common District Context ---
        $districtData = [
            'tasks' => \App\Models\DistrictTask::where('district_id', $church?->district_id)->get(),
            'events' => \App\Models\DistrictEvent::where('district_id', $church?->district_id)->where('workflow_status', 'published')->get(),
            'bulletins' => \App\Models\DistrictBulletin::where('district_id', $church?->district_id)
                ->where('workflow_status', 'published')
                ->with(['author:id,name', 'acknowledgements' => fn($q) => $q->where('user_id', $user->id)])
                ->get(),
        ];

        return Inertia::render('Dashboard/LeadershipDashboard', [
            'section' => $section,
            'personal' => $personalData,
            'modules' => $modules,
            'district' => $districtData,
            'church' => $church ? $church->only(['id', 'name']) : null,
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
            'district_tasks' => \App\Models\DistrictTask::where('district_id', $church->district_id)->whereIn('workflow_status', ['assigned', 'closed', 'reviewed'])->orderBy('deadline', 'asc')->get(),
            'district_events' => \App\Models\DistrictEvent::where('district_id', $church->district_id)->where('workflow_status', 'published')->get(),
            'district_resources' => \App\Models\DistrictResource::where('district_id', $church->district_id)->latest()->get(),
            'district_bulletins' => \App\Models\DistrictBulletin::where('district_id', $church->district_id)
                ->where('workflow_status', 'published')
                ->with(['author:id,name', 'acknowledgements' => fn($q) => $q->where('user_id', $user->id)])
                ->get(),
            'parent_link_requests' => \App\Models\PendingParentLink::whereIn('pathfinder_id', $pathfinders->pluck('id'))->where('status', 'pending')->with(['user', 'pathfinder'])->get(),
            'pending_approvals' => User::whereHas('roles', fn($q) => $q->where('role_user.status', 'pending'))
                ->where('church_id', $church->id)
                ->with(['roles', 'church', 'district'])
                ->get(),
            'parents' => User::where('church_id', $church->id)->get()->filter(fn($u) => $u->hasRole('parent'))->values(),
            'section' => $section,
        ]);
    }

    /**
     * DEPRECATED: This method renders the Master Guide dashboard.
     * In Phase 3, this will be replaced with a Staff dashboard that shows:
     * - Staff profile (club_staff table)
     * - Credentials (staff_credentials table)
     * - Current assignments
     * - Training progress
     *
     * For now, this is kept for backward compatibility during Phase 1 transition.
     */
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
            'announcements' => \App\Models\DistrictBulletin::where('workflow_status', 'published')
                ->where('district_id', $user->church?->district_id)
                ->with(['author:id,name', 'acknowledgements' => fn($q) => $q->where('user_id', $user->id)])
                ->latest()
                ->get(),
            'curriculum' => $curriculum,
        ]);
    }

    protected function renderParent(User $user, $section)
    {
        return Inertia::render('Dashboard/Parent', [
            'profile' => $user->parentProfile,
            'children' => $user->children()->with(['assignedClass', 'unit', 'registrations.event'])->get(),
            'requests' => $user->pendingLinks()->with('pathfinder')->get(),
            'announcements' => \App\Models\DistrictBulletin::where('workflow_status', 'published')
                ->where('district_id', $user->church?->district_id)
                ->with(['author:id,name', 'acknowledgements' => fn($q) => $q->where('user_id', $user->id)])
                ->latest()
                ->get(),
        ]);
    }

    protected function renderObserver(User $user, $section)
    {
        return Inertia::render('Dashboard/Observer', [
            'user' => $user->only('id', 'name', 'email'),
            'bulletins' => \App\Models\DistrictBulletin::where('workflow_status', 'published')
                ->with(['author:id,name', 'acknowledgements' => fn($q) => $q->where('user_id', $user->id)])
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }
}
