<?php

namespace App\Services;

use App\Models\AttendanceSession;
use App\Models\Church;
use App\Models\ClassLeaderAssignment;
use App\Models\ClubOperation;
use App\Models\Committee;
use App\Models\MasterGuide;
use App\Models\MgTraining;
use App\Models\Pathfinder;
use App\Models\PathfinderClass;
use App\Models\Religion;
use App\Models\Unit;

class ClubCommandCenterService
{
    /**
     * Ensure required per-church records exist.
     */
    public function ensureBaseRecords(Church $church): void
    {
        $committeeTypes = ['executive', 'staff', 'pathfinder'];
        foreach ($committeeTypes as $type) {
            Committee::firstOrCreate([
                'church_id' => $church->id,
                'type' => $type,
            ]);
        }

        ClubOperation::firstOrCreate([
            'church_id' => $church->id,
        ], [
            'weekly_meeting_frequency' => 1,
            'departments' => [],
        ]);
    }

    public function buildForChurch(Church $church): array
    {
        $this->ensureBaseRecords($church);

        $classes = PathfinderClass::query()
            ->orderBy('id')
            ->get(['id', 'name']);

        $masterGuides = MasterGuide::query()
            ->where('church_id', $church->id)
            ->with(['assignedClass:id,name', 'religion:id,name'])
            ->orderBy('full_name')
            ->get();

        $pathfinders = Pathfinder::query()
            ->where('church_id', $church->id)
            ->with([
                'classAssignment.pathfinderClass:id,name',
                'unitMembership.unit:id,name,gender',
                'religion:id,name',
            ])
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'age',
                'gender',
                'guardian_name',
                'guardian_phone',
                'father_name',
                'mother_name',
                'religion_id',
                'other_religion',
                'residence',
                'school_class',
                'is_inducted',
                'insured_yearly',
                'boarding_status',
                'medical_conditions',
                'consent',
                'church_id',
            ]);

        $latestSession = AttendanceSession::query()
            ->where('church_id', $church->id)
            ->with('records')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->first();

        $attendanceSummary = null;
        if ($latestSession) {
            $present = $latestSession->records->where('is_present', true)->count();
            $total = $latestSession->records->count();
            $attendanceSummary = [
                'date' => $latestSession->date->toDateString(),
                'type' => $latestSession->type,
                'present' => $present,
                'absent' => $total - $present,
                'total' => $total,
            ];
        }

        $mgTraining = MgTraining::query()
            ->whereHas('masterGuide', fn ($q) => $q->where('church_id', $church->id))
            ->with([
                'masterGuide:id,full_name,role,church_id',
                'assignedMentor:id,full_name,role,church_id',
            ])
            ->orderByDesc('training_start_date')
            ->get();

        $classLeaderAssignments = ClassLeaderAssignment::query()
            ->whereHas('masterGuide', fn ($q) => $q->where('church_id', $church->id))
            ->with(['masterGuide:id,full_name,actively_teaching,role,church_id'])
            ->get()
            ->groupBy('class_id');

        $units = Unit::query()
            ->where('church_id', $church->id)
            ->with([
                'members.pathfinder.classAssignment.pathfinderClass:id,name',
                'roles.captain:id,name,gender',
                'roles.scribe:id,name,gender',
                'roles.counselor:id,full_name,role',
            ])
            ->orderBy('gender')
            ->orderBy('name')
            ->get();

        $committees = Committee::query()
            ->where('church_id', $church->id)
            ->with(['members.user:id,name,email', 'members.pathfinder:id,name,gender', 'members.masterGuide:id,full_name,role'])
            ->get()
            ->keyBy('type');

        $clubOperation = ClubOperation::query()
            ->where('church_id', $church->id)
            ->first();

        $classTotals = [];
        foreach ($classes as $c) {
            $classTotals[$c->id] = 0;
        }
        foreach ($pathfinders as $p) {
            $classId = $p->classAssignment?->class_id;
            if ($classId && isset($classTotals[$classId])) {
                $classTotals[$classId] += 1;
            }
        }

        $classesPayload = $classes->map(function ($c) use ($classTotals, $classLeaderAssignments) {
            $leadersForClass = $classLeaderAssignments->get($c->id, collect());

            $byRole = [
                'master_guide' => [],
                'counselor' => [],
                'instructor' => [],
            ];

            foreach ($leadersForClass as $la) {
                $role = $la->role;
                if (!isset($byRole[$role])) {
                    continue;
                }
                $byRole[$role][] = [
                    'id' => $la->masterGuide->id,
                    'full_name' => $la->masterGuide->full_name,
                    'actively_teaching' => (bool) $la->masterGuide->actively_teaching,
                ];
            }

            return [
                'id' => $c->id,
                'name' => $c->name,
                'pathfinder_count' => $classTotals[$c->id] ?? 0,
                'leaders' => $byRole,
                'active_instructors' => collect($byRole['instructor'])->where('actively_teaching', true)->count(),
            ];
        })->values();

        $unitsPayload = $units->map(function ($u) {
            $members = $u->members->map(function ($m) {
                return [
                    'id' => $m->pathfinder->id,
                    'name' => $m->pathfinder->name,
                    'gender' => $m->pathfinder->gender,
                    'class' => $m->pathfinder->classAssignment?->pathfinderClass
                        ? [
                            'id' => $m->pathfinder->classAssignment->pathfinderClass->id,
                            'name' => $m->pathfinder->classAssignment->pathfinderClass->name,
                        ]
                        : null,
                ];
            });

            $distribution = $members
                ->filter(fn ($p) => $p['class'])
                ->groupBy(fn ($p) => $p['class']['name'])
                ->map(fn ($group, $name) => ['class_name' => $name, 'count' => $group->count()])
                ->values();

            $memberCount = $members->count();

            return [
                'id' => $u->id,
                'name' => $u->name,
                'gender' => $u->gender,
                'member_count' => $memberCount,
                'member_status' => $memberCount < 6 ? 'below_minimum' : ($memberCount > 8 ? 'above_recommended' : 'ok'),
                'members' => $members->values(),
                'class_distribution' => $distribution,
                'roles' => [
                    'captain' => $u->roles?->captain ? ['id' => $u->roles->captain->id, 'name' => $u->roles->captain->name] : null,
                    'scribe' => $u->roles?->scribe ? ['id' => $u->roles->scribe->id, 'name' => $u->roles->scribe->name] : null,
                    'counselor' => $u->roles?->counselor ? ['id' => $u->roles->counselor->id, 'full_name' => $u->roles->counselor->full_name] : null,
                ],
            ];
        })->values();

        $derivedPathfinderCommittee = $unitsPayload
            ->flatMap(function ($u) {
                $rows = [];
                if ($u['roles']['captain']) {
                    $rows[] = [
                        'role' => 'Unit Captain',
                        'unit' => $u['name'],
                        'member' => $u['roles']['captain'],
                    ];
                }
                if ($u['roles']['scribe']) {
                    $rows[] = [
                        'role' => 'Unit Scribe',
                        'unit' => $u['name'],
                        'member' => $u['roles']['scribe'],
                    ];
                }
                return $rows;
            })
            ->values();

        $committeePayload = [];
        foreach (['executive', 'staff', 'pathfinder'] as $type) {
            $committeePayload[$type] = ($committees->get($type)?->members ?? collect())
                ->map(function ($m) {
                    if ($m->user) {
                        return [
                            'id' => $m->id,
                            'role' => $m->role,
                            'member_type' => 'user',
                            'member' => ['id' => $m->user->id, 'name' => $m->user->name],
                        ];
                    }
                    if ($m->masterGuide) {
                        return [
                            'id' => $m->id,
                            'role' => $m->role,
                            'member_type' => 'master_guide',
                            'member' => ['id' => $m->masterGuide->id, 'name' => $m->masterGuide->full_name],
                        ];
                    }
                    if ($m->pathfinder) {
                        return [
                            'id' => $m->id,
                            'role' => $m->role,
                            'member_type' => 'pathfinder',
                            'member' => ['id' => $m->pathfinder->id, 'name' => $m->pathfinder->name],
                        ];
                    }

                    return [
                        'id' => $m->id,
                        'role' => $m->role,
                        'member_type' => 'unknown',
                        'member' => null,
                    ];
                })
                ->sortBy('role')
                ->values();
        }

        $mgTotals = [
            'total' => $masterGuides->count(),
            'mg' => $masterGuides->where('role', 'MG')->count(),
            'mgt' => $masterGuides->whereIn('role', ['MGT', 'MGiT'])->count(),
        ];

        return [
            'church' => [
                'id' => $church->id,
                'name' => $church->name,
                'location' => $church->location,
            ],
            'overview' => [
                'total_pathfinders' => $pathfinders->count(),
                'boarding_stats' => [
                    'boarding' => $pathfinders->where('boarding_status', 'boarding')->count(),
                    'day' => $pathfinders->where('boarding_status', 'day')->count(),
                ],
                'latest_attendance' => $attendanceSummary,
                'class_totals' => $classes->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'count' => $classTotals[$c->id] ?? 0,
                ])->values(),
                'master_guides' => $mgTotals,
                'weekly_meeting_frequency' => $clubOperation?->weekly_meeting_frequency ?? 1,
            ],
            'classes' => $classesPayload,
            'units' => $unitsPayload,
            'committees' => $committeePayload,
            'derived_pathfinder_committee' => $derivedPathfinderCommittee,
            'pathfinders' => $pathfinders->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'age' => $p->age,
                'gender' => $p->gender,
                'guardian_name' => $p->guardian_name,
                'guardian_phone' => $p->guardian_phone,
                'father_name' => $p->father_name,
                'mother_name' => $p->mother_name,
                'religion' => $p->religion ? ['id' => $p->religion->id, 'name' => $p->religion->name] : null,
                'other_religion' => $p->other_religion,
                'residence' => $p->residence,
                'school_class' => $p->school_class,
                'boarding_status' => $p->boarding_status,
                'is_inducted' => (bool) $p->is_inducted,
                'insured_yearly' => (bool) $p->insured_yearly,
                'medical_conditions' => $p->medical_conditions,
                'consent' => (bool) $p->consent,
                'assigned_class' => $p->classAssignment?->pathfinderClass
                    ? [
                        'id' => $p->classAssignment->pathfinderClass->id,
                        'name' => $p->classAssignment->pathfinderClass->name,
                    ]
                    : null,
                'unit' => $p->unitMembership?->unit
                    ? [
                        'id' => $p->unitMembership->unit->id,
                        'name' => $p->unitMembership->unit->name,
                        'gender' => $p->unitMembership->unit->gender,
                    ]
                    : null,
            ])->values(),
            'master_guides' => $masterGuides->map(fn ($mg) => [
                'id' => $mg->id,
                'full_name' => $mg->full_name,
                'role' => $mg->role,
                'assigned_class' => $mg->assignedClass ? ['id' => $mg->assignedClass->id, 'name' => $mg->assignedClass->name] : null,
                'religion' => $mg->religion ? ['id' => $mg->religion->id, 'name' => $mg->religion->name] : null,
                'other_religion' => $mg->other_religion,
                'residence' => $mg->residence,
                'occupation_status' => $mg->occupation_status,
                'insured_yearly' => (bool) $mg->insured_yearly,
                'actively_teaching' => (bool) $mg->actively_teaching,
                'responsibility' => $mg->responsibility,
                'other_church_responsibility' => $mg->other_church_responsibility,
            ])->values(),
            'mg_training' => $mgTraining->map(fn ($t) => [
                'id' => $t->id,
                'master_guide' => [
                    'id' => $t->masterGuide->id,
                    'full_name' => $t->masterGuide->full_name,
                    'role' => $t->masterGuide->role,
                ],
                'training_start_date' => $t->training_start_date?->toDateString(),
                'expected_completion_date' => $t->expected_completion_date?->toDateString(),
                'status' => $t->status,
                'assigned_mentor' => $t->assignedMentor ? [
                    'id' => $t->assignedMentor->id,
                    'full_name' => $t->assignedMentor->full_name,
                ] : null,
            ])->values(),
            'operations' => [
                'weekly_meeting_frequency' => $clubOperation?->weekly_meeting_frequency ?? 1,
                'departments' => $clubOperation?->departments ?? [],
            ],
            // Useful pick-lists for the Director UI
            'picklists' => [
                'classes' => $classes->values(),
                'pathfinders' => $pathfinders->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'gender' => $p->gender])->values(),
                'master_guides' => $masterGuides->map(fn ($mg) => ['id' => $mg->id, 'full_name' => $mg->full_name, 'role' => $mg->role])->values(),
                'units' => $units->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'gender' => $u->gender])->values(),
                'religions' => Religion::query()
                    ->whereNull('church_id')
                    ->orWhere('church_id', $church->id)
                    ->orderBy('name')
                    ->get(['id', 'name']),
                'attendance_sessions' => AttendanceSession::query()
                    ->where('church_id', $church->id)
                    ->orderByDesc('date')
                    ->limit(10)
                    ->get(),
            ],
        ];
    }
}
