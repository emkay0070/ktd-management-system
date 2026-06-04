<?php

use App\Http\Controllers\ClassLeaderAssignmentController;
use App\Http\Controllers\ClubOperationsController;
use App\Http\Controllers\ClubViewerController;
use App\Http\Controllers\CommitteeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VerificationController;

use App\Models\Church;
use App\Http\Controllers\DistrictCommitteeController;
use App\Http\Controllers\DistrictEventController;
use App\Http\Controllers\DistrictResourceController;
use App\Http\Controllers\DistrictTaskController;
use App\Http\Controllers\DistrictBulletinController;
use App\Http\Controllers\DistrictAppraisalController;
use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\TaskSubmissionController;
use App\Http\Controllers\MasterGuideController;
use App\Http\Controllers\MgTrainingController;
use App\Http\Controllers\PathfinderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UnitMemberController;
use App\Http\Controllers\UnitRoleController;
use App\Http\Controllers\InviteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'store'])->name('onboarding.store');
});

Route::middleware(['auth', 'verified', 'onboarded'])->group(function () {
    Route::get('/dashboard/{section?}', [DashboardController::class, 'index'])->name('dashboard');

    // District view (read-only)
    Route::get('/clubs/{church}', [ClubViewerController::class, 'show'])->name('clubs.show');
    
    // District Official Actions
    Route::post('/district/committee', [DistrictCommitteeController::class, 'store'])->name('district_committee.store');
    Route::delete('/district/committee/{user}', [DistrictCommitteeController::class, 'destroy'])->name('district_committee.destroy');

    // District Club/Church Actions
    Route::post('/district/churches', [\App\Http\Controllers\DistrictChurchController::class, 'store'])->name('district_churches.store');

    // District Event Scheduling Actions
    Route::post('/district/events', [DistrictEventController::class, 'store'])->name('district_events.store');
    Route::delete('/district/events/{event}', [DistrictEventController::class, 'destroy'])->name('district_events.destroy');
    Route::post('/district/events/{event}/toggle-publish', [DistrictEventController::class, 'togglePublish'])->name('district_events.toggle_publish');

    // District Tasks & Competitions
    Route::post('/district/tasks', [DistrictTaskController::class, 'store'])->name('district_tasks.store');
    Route::delete('/district/tasks/{task}', [DistrictTaskController::class, 'destroy'])->name('district_tasks.destroy');
    Route::post('/district/submissions/{submission}/review', [DistrictTaskController::class, 'reviewSubmission'])->name('district_tasks.review');
    
    // District Resources Library
    Route::post('/district/resources', [DistrictResourceController::class, 'store'])->name('district_resources.store');
    Route::delete('/district/resources/{resource}', [DistrictResourceController::class, 'destroy'])->name('district_resources.destroy');

    // District Bulletins & Appraisals
    Route::post('/district/bulletins', [DistrictBulletinController::class, 'store'])->name('district_bulletins.store');
    Route::delete('/district/bulletins/{bulletin}', [DistrictBulletinController::class, 'destroy'])->name('district_bulletins.destroy');
    Route::post('/district/bulletins/{bulletin}/toggle', [DistrictBulletinController::class, 'toggle'])->name('district_bulletins.toggle');

    Route::post('/district/appraisals', [DistrictAppraisalController::class, 'store'])->name('district_appraisals.store');
    Route::delete('/district/appraisals/{appraisal}', [DistrictAppraisalController::class, 'destroy'])->name('district_appraisals.destroy');

    // Event Registrations
    Route::post('/registrations/bulk', [EventRegistrationController::class, 'storeBulk'])->name('registrations.bulk');
    Route::patch('/registrations/{registration}/payment', [EventRegistrationController::class, 'updatePayment'])->name('registrations.payment');
    Route::post('/registrations/{registration}/approve', [EventRegistrationController::class, 'approve'])->name('registrations.approve');
    Route::delete('/registrations/{registration}', [EventRegistrationController::class, 'destroy'])->name('registrations.destroy');

    // Club Submissions
    Route::post('/club/tasks/submit', [TaskSubmissionController::class, 'store'])->name('club_tasks.submit');

    // Club Command Center (Director-only writes; controllers enforce role + church scoping)
    Route::get('/club/pathfinders', [PathfinderController::class, 'index'])->name('pathfinders.index');
    Route::post('/club/pathfinders', [PathfinderController::class, 'store'])->name('pathfinders.store');
    Route::post('/club/pathfinders/bulk', [PathfinderController::class, 'storeBulk'])->name('pathfinders.bulk_store');
    Route::get('/club/pathfinders/{pathfinder}', [PathfinderController::class, 'show'])->name('pathfinders.show');
    Route::get('/club/pathfinders/{pathfinder}/edit', [PathfinderController::class, 'edit'])->name('pathfinders.edit');
    Route::put('/club/pathfinders/{pathfinder}', [PathfinderController::class, 'update'])->name('pathfinders.update');
    Route::delete('/club/pathfinders/{pathfinder}', [PathfinderController::class, 'destroy'])->name('pathfinders.destroy');

    Route::post('/club/units', [UnitController::class, 'store'])->name('units.store');
    Route::put('/club/units/{unit}', [UnitController::class, 'update'])->name('units.update');
    Route::delete('/club/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
    Route::post('/club/units/{unit}/members', [UnitMemberController::class, 'store'])->name('units.members.store');
    Route::delete('/club/units/{unit}/members/{pathfinder}', [UnitMemberController::class, 'destroy'])->name('units.members.destroy');
    Route::put('/club/units/{unit}/roles', [UnitRoleController::class, 'update'])->name('units.roles.update');

    Route::post('/club/master-guides', [MasterGuideController::class, 'store'])->name('master_guides.store');
    Route::post('/club/master-guides/bulk', [MasterGuideController::class, 'storeBulk'])->name('master_guides.bulk_store');
    Route::get('/club/master-guides/{masterGuide}', [MasterGuideController::class, 'show'])->name('master_guides.show');
    Route::get('/club/master-guides/{masterGuide}/edit', [MasterGuideController::class, 'edit'])->name('master_guides.edit');
    Route::put('/club/master-guides/{masterGuide}', [MasterGuideController::class, 'update'])->name('master_guides.update');
    Route::delete('/club/master-guides/{masterGuide}', [MasterGuideController::class, 'destroy'])->name('master_guides.destroy');

    Route::post('/curriculum/{pathfinder}/signoff/{requirement}', [\App\Http\Controllers\CurriculumController::class, 'signoff'])
        ->name('curriculum.signoff');

    Route::post('/club/mg-training', [MgTrainingController::class, 'store'])->name('mg_training.store');
    Route::put('/club/mg-training/{mgTraining}', [MgTrainingController::class, 'update'])->name('mg_training.update');
    Route::delete('/club/mg-training/{mgTraining}', [MgTrainingController::class, 'destroy'])->name('mg_training.destroy');

    Route::post('/club/classes/{class}/leaders', [ClassLeaderAssignmentController::class, 'store'])->name('classes.leaders.store');
    Route::delete('/club/classes/{class}/leaders/{assignment}', [ClassLeaderAssignmentController::class, 'destroy'])->name('classes.leaders.destroy');

    Route::post('/club/committees/{type}/members', [CommitteeController::class, 'storeMember'])->name('committees.members.store');
    Route::delete('/club/committees/members/{committeeMember}', [CommitteeController::class, 'destroyMember'])->name('committees.members.destroy');

    Route::put('/club/operations', [ClubOperationsController::class, 'update'])->name('club.operations.update');

    Route::post('/club/attendance', [\App\Http\Controllers\AttendanceController::class, 'store'])->name('attendance.store');
    // Parent Linking & Management
    Route::post('/club/parent-links', [\App\Http\Controllers\ParentLinkController::class, 'store'])->name('parent_links.store');
    Route::post('/club/parent-links/{link}/approve', [\App\Http\Controllers\ParentLinkController::class, 'approve'])->name('parent_links.approve');
    Route::post('/club/parent-links/{link}/reject', [\App\Http\Controllers\ParentLinkController::class, 'reject'])->name('parent_links.reject');

    Route::delete('/club/attendance/{session}', [\App\Http\Controllers\AttendanceController::class, 'destroy'])->name('attendance.destroy');

    // ── Role Context Switcher ───────────────────────────────────────────────
    Route::post('/role/switch-context', [\App\Http\Controllers\RoleContextController::class, 'switch'])
        ->name('role.switch_context');

    // ── Super Admin — Verification Actions ──────────────────────────────────
    Route::post('/admin/churches/{church}/approve', [VerificationController::class, 'approveChurch'])
        ->name('verification.churches.approve');
    Route::post('/admin/churches/{church}/reject', [VerificationController::class, 'rejectChurch'])
        ->name('verification.churches.reject');
    Route::post('/admin/roles/{user}/approve', [VerificationController::class, 'approveRole'])
        ->name('verification.roles.approve');
    Route::post('/admin/roles/{user}/reject', [VerificationController::class, 'rejectRole'])
        ->name('verification.roles.reject');

    // ── Super Admin — District Directors ────────────────────────────────────
    Route::post('/admin/districts', [\App\Http\Controllers\DistrictDirectorController::class, 'storeDistrict'])->name('admin.districts.store');
    Route::post('/admin/districts/{district}/directors/assign', [\App\Http\Controllers\DistrictDirectorController::class, 'assignDirector'])->name('admin.district-directors.assign');
    Route::delete('/admin/directors/{user}/remove', [\App\Http\Controllers\DistrictDirectorController::class, 'removeDirector'])->name('admin.district-directors.remove');
    Route::post('/admin/directors/{user}/assign-unassigned', [\App\Http\Controllers\DistrictDirectorController::class, 'assignUnassignedDirector'])->name('admin.district-directors.assign-unassigned');

});

// ── Invitations ─────────────────────────────────────────────────────────
Route::get('/invites/accept', [InviteController::class, 'show'])->name('invites.show');
Route::post('/invites/accept', [InviteController::class, 'accept'])->middleware('auth')->name('invites.accept');

// ── Public Hierarchy API (used by registration wizard + onboarding) ──────
Route::get('/api/hierarchy/unions', function () {
    return \App\Models\Union::orderBy('name')->get(['id', 'name']);
})->name('hierarchy.unions');

Route::get('/api/hierarchy/conferences', function (\Illuminate\Http\Request $request) {
    return \App\Models\Conference::where('union_id', $request->get('union_id'))
        ->orderBy('name')->get(['id', 'name']);
})->name('hierarchy.conferences');

Route::get('/api/hierarchy/zones', function (\Illuminate\Http\Request $request) {
    return \App\Models\Zone::where('conference_id', $request->get('conference_id'))
        ->orderBy('name')->get(['id', 'name']);
})->name('hierarchy.zones');

Route::get('/api/hierarchy/districts', function (\Illuminate\Http\Request $request) {
    $query = \App\Models\District::query();
    if ($request->has('zone_id')) $query->where('zone_id', $request->get('zone_id'));
    if ($request->has('conference_id')) $query->where('conference_id', $request->get('conference_id'));
    return $query->orderBy('name')->get(['id', 'name']);
})->name('hierarchy.districts');

Route::get('/api/churches/search', function (\Illuminate\Http\Request $request) {
    $query = $request->get('q', '');
    $districtId = $request->get('district_id');
    
    $churches = \App\Models\Church::where('status', 'approved')
        ->when($districtId, fn($q) => $q->where('district_id', $districtId))
        ->when($query, function($q) use ($query) {
            $q->where(function($subQ) use ($query) {
                $subQ->where('name', 'ilike', "%{$query}%")
                     ->orWhere('location', 'ilike', "%{$query}%");
            });
        })
        ->limit(20)
        ->get(['id', 'name', 'location']);
        
    return $churches;
})->name('churches.search');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── Onboarding Status Polling (JSON only) ────────────────────────────────
    Route::get('/api/onboarding/status', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $pendingRoles = $user->roles()->wherePivot('status', 'pending')->pluck('name')->toArray();
        $hasLeadershipPending = count(array_intersect(['district_official', 'district_director', 'district_treasurer', 'district_secretary', 'district_committee', 'district_curriculum_coordinator', 'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 'district_pbe_coordinator', 'district_programs_coordinator', 'director'], $pendingRoles)) > 0;

        return response()->json([
            'approved' => !$hasLeadershipPending,
        ]);
    })->name('onboarding.status');
});

require __DIR__.'/auth.php';
