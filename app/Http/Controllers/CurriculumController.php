<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pathfinder;
use App\Models\CurriculumRequirement;
use App\Models\CurriculumProgress;
use App\Models\ClassAssignment;
use App\Models\CurriculumStandard;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Facades\DB;

class CurriculumController extends Controller
{
    /**
     * Export Curriculum Report as PDF
     */
    public function exportPdf(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $data = $this->getReportData($user);
        
        $pdf = Pdf::loadView('exports.curriculum-report', $data);
        return $pdf->download('District-Curriculum-Report-'.date('Y-m-d').'.pdf');
    }

    /**
     * Export Curriculum Report as DOCX
     */
    public function exportDocx(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $data = $this->getReportData($user);
        
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        
        // Header
        $section->addTitle($data['district_name'], 1);
        $section->addText('Official Curriculum & Pathfinder Progress Report');
        $section->addText('Generated on ' . date('F d, Y'));
        $section->addTextBreak(1);

        // Stats
        $section->addTitle('Summary Stats', 2);
        $section->addText("Total Pathfinders: {$data['totals']['Total']}");
        $section->addText("Honours Earned: {$data['honour_analytics']['total_earned']}");
        $section->addText("Investiture Ready: {$data['totals']['Ready']}");
        $section->addText("District Health: {$data['avg_health']}%");
        $section->addTextBreak(1);

        // Table
        $section->addTitle('Club Performance', 2);
        $table = $section->addTable(['borderSize' => 6, 'borderColor' => '999999', 'cellMargin' => 80]);
        $table->addRow();
        $table->addCell(3000)->addText('Club Name', ['bold' => true]);
        $table->addCell(1500)->addText('Health', ['bold' => true]);
        $table->addCell(2500)->addText('Distribution', ['bold' => true]);
        $table->addCell(1000)->addText('Ready', ['bold' => true]);
        $table->addCell(1000)->addText('Honours', ['bold' => true]);

        foreach ($data['curriculum_stats'] as $club) {
            $table->addRow();
            $table->addCell(3000)->addText($club['church']['name']);
            $table->addCell(1500)->addText($club['health_score'] . '%');
            $table->addCell(2500)->addText($club['stats']['Friend'].'/'.$club['stats']['Companion'].'/'.$club['stats']['Explorer'].'/'.$club['stats']['Ranger'].'/'.$club['stats']['Voyager'].'/'.$club['stats']['Guide']);
            $table->addCell(1000)->addText($club['stats']['Ready']);
            $table->addCell(1000)->addText($club['honours_earned']);
        }

        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $fileName = 'District-Curriculum-Report-'.date('Y-m-d').'.docx';
        $tempFile = tempnam(sys_get_temp_dir(), 'phpword');
        $objWriter->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Internal helper to get consistent report data
     */
    private function getReportData($user)
    {
        $district = $user->district;
        
        // This is a simplified version of the logic in DashboardRouterService
        // In a real production app, this should be in a Service class
        $curriculumStats = [];
        $districtHonoursEarned = 0;
        $honourCounts = [];
        $totalReady = 0;
        $totalMembers = 0;
        $totalHealth = 0;

        foreach ($district->churches as $church) {
            $stats = ['Friend' => 0, 'Companion' => 0, 'Explorer' => 0, 'Ranger' => 0, 'Voyager' => 0, 'Guide' => 0, 'Ready' => 0];
            $pathfinders = \App\Models\Pathfinder::where('church_id', $church->id)
                ->with(['classAssignment.pathfinderClass', 'honours'])
                ->get();
            
            $pfCount = $pathfinders->count();
            $totalMembers += $pfCount;
            $churchHonours = 0;

            foreach ($pathfinders as $pf) {
                if ($pf->classAssignment && $pf->classAssignment->pathfinderClass) {
                    $className = $pf->classAssignment->pathfinderClass->name;
                    if (isset($stats[$className])) $stats[$className]++;
                    if ($pf->classAssignment->investiture_status !== 'not_ready') $stats['Ready']++;
                }

                foreach ($pf->honours as $honour) {
                    $churchHonours++;
                    $districtHonoursEarned++;
                    $honourCounts[$honour->name] = ($honourCounts[$honour->name] ?? 0) + 1;
                }
            }

            $totalReady += $stats['Ready'];
            
            // Simplified health score for report
            $healthScore = $pfCount > 0 ? round(($stats['Ready'] / $pfCount) * 100) : 0;
            $totalHealth += $healthScore;

            $curriculumStats[] = [
                'church' => ['name' => $church->name],
                'stats' => $stats,
                'honours_earned' => $churchHonours,
                'health_score' => $healthScore,
            ];
        }

        arsort($honourCounts);
        $topHonours = [];
        foreach (array_slice($honourCounts, 0, 5, true) as $name => $count) {
            $topHonours[] = ['name' => $name, 'count' => $count];
        }

        return [
            'district_name' => $district->name,
            'curriculum_stats' => $curriculumStats,
            'avg_health' => count($district->churches) > 0 ? round($totalHealth / count($district->churches)) : 0,
            'totals' => [
                'Total' => $totalMembers,
                'Ready' => $totalReady,
            ],
            'honour_analytics' => [
                'total_earned' => $districtHonoursEarned,
                'top_honours' => $topHonours,
            ]
        ];
    }

    /**
     * Sign off a requirement for a pathfinder.
     */
    public function signoff(Request $request, Pathfinder $pathfinder, CurriculumRequirement $requirement)
    {
        $user = $request->user();
        
        // Ensure user is a Master Guide and is assigned to the same class
        abort_unless($user->hasRole('master_guide'), 403);
        
        $masterGuide = $user->masterGuide;
        abort_unless($masterGuide && $masterGuide->church_id === $pathfinder->church_id, 403);
        
        $classAssignment = $pathfinder->classAssignment;
        abort_unless($classAssignment && $classAssignment->class_id === $masterGuide->assigned_class_id, 403);
        abort_unless($requirement->class_id === $masterGuide->assigned_class_id, 403);

        CurriculumProgress::firstOrCreate([
            'pathfinder_id' => $pathfinder->id,
            'requirement_id' => $requirement->id,
        ], [
            'completed_at' => now(),
            'verified_by' => $user->id,
        ]);

        return back()->with('message', 'Requirement signed off successfully.');
    }

    // ── Investiture Workflow ───────────────────────────────────────────────

    public function readyForReview(Request $request, ClassAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user->hasRole('director') && $user->church_id === $assignment->pathfinder->church_id, 403);

        $assignment->update(['investiture_status' => 'pending_review']);

        return back()->with('message', 'Pathfinder submitted for district curriculum review.');
    }

    public function recommend(Request $request, ClassAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user->hasRole('district_curriculum_coordinator'), 403);

        $request->validate(['notes' => 'nullable|string']);

        $assignment->update([
            'investiture_status' => 'recommended',
            'investiture_recommendation_notes' => $request->notes,
            'recommended_by' => $user->id,
            'recommended_at' => now(),
        ]);

        return back()->with('message', 'Recommendation sent to District Director.');
    }

    public function approve(Request $request, ClassAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user->hasRole('district_director') || $user->hasRole('super_admin'), 403);

        $assignment->update([
            'investiture_status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return back()->with('message', 'Investiture approved.');
    }

    public function markInvested(Request $request, ClassAssignment $assignment)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_director', 'district_curriculum_coordinator', 'super_admin']), 403);

        $assignment->update(['investiture_status' => 'invested']);

        return back()->with('message', 'Pathfinder marked as invested.');
    }

    // ── Curriculum Standards ───────────────────────────────────────────────

    public function storeStandard(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'department' => 'required|in:Pathfinders,Adventurers',
        ]);

        CurriculumStandard::create([
            'district_id' => $user->district_id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'department' => $validated['department'],
            'created_by' => $user->id,
            'workflow_status' => 'draft',
        ]);

        return back()->with('message', 'Curriculum standard created as draft.');
    }

    public function updateStandard(Request $request, CurriculumStandard $standard)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($standard->district_id === $user->district_id, 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'department' => 'required|in:Pathfinders,Adventurers',
        ]);

        $standard->update($validated);

        return back()->with('message', 'Curriculum standard updated.');
    }

    public function toggleStandardStatus(Request $request, CurriculumStandard $standard)
    {
        $user = $request->user();
        // Only Director can publish, but Coordinator can move to 'review' if we had that state.
        // For now, let's allow both to toggle draft/published as requested.
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($standard->district_id === $user->district_id, 403);

        $newStatus = $standard->workflow_status === 'published' ? 'draft' : 'published';
        $standard->update(['workflow_status' => $newStatus]);

        return back()->with('message', "Standard status updated to {$newStatus}.");
    }

    public function destroyStandard(Request $request, CurriculumStandard $standard)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($standard->district_id === $user->district_id, 403);

        $standard->delete();

        return back()->with('message', 'Curriculum standard removed.');
    }
}
