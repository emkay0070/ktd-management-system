<?php

namespace App\Http\Controllers;

use App\Models\DistrictResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DistrictResourceController extends Controller
{
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        abort_unless($user && ($user->isDistrictExecutive() || $user->isDistrictCoordinator()), 403);

        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'department' => 'nullable|string',
            'description' => 'nullable|string',
            'file' => 'required|file|max:102400', // 100MB Large Support
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $sizeBytes = $file->getSize();
        
        // Format size
        $units = ['B', 'KB', 'MB', 'GB'];
        $power = $sizeBytes > 0 ? floor(log($sizeBytes, 1024)) : 0;
        $formattedSize = number_format($sizeBytes / pow(1024, $power), 2) . ' ' . $units[$power];

        $path = $file->store('district_resources', 'public');

        DistrictResource::create([
            'district_id' => $user->district_id,
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $path,
            'file_type' => strtoupper($extension),
            'file_size' => $formattedSize,
            'category' => $request->category,
            'department' => $request->department,
            'uploaded_by' => $user->id,
            'workflow_status' => 'draft',
        ]);

        return back()->with('message', 'Resource created as draft.');
    }

    public function requestApproval(Request $request, DistrictResource $resource)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'super_admin']), 403);
        abort_unless($resource->district_id === $user->district_id, 403);

        $resource->update(['workflow_status' => 'pending_approval']);

        return back()->with('message', 'Resource submitted for District Director approval.');
    }

    public function approve(Request $request, DistrictResource $resource)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_director', 'super_admin']), 403);
        abort_unless($resource->district_id === $user->district_id, 403);

        $resource->update([
            'workflow_status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return back()->with('message', 'Resource approved. The coordinator can now publish it.');
    }

    public function publish(Request $request, DistrictResource $resource)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        abort_unless($user->hasAnyRole(['district_curriculum_coordinator', 'district_director', 'super_admin']), 403);
        abort_unless($resource->district_id === $user->district_id, 403);

        if ($resource->workflow_status !== 'approved' && !$user->hasAnyRole(['district_director', 'super_admin'])) {
            return back()->withErrors(['resource' => 'This resource must be approved by the Director before publishing.']);
        }

        $resource->update(['workflow_status' => 'published']);

        return back()->with('message', 'Resource published to the district library.');
    }

    public function destroy(Request $request, DistrictResource $resource)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        // Only director, secretary or the uploader can delete
        $canDelete = $user->hasAnyRole(['district_director', 'district_secretary', 'super_admin']) || $resource->uploaded_by === $user->id;
        
        abort_unless($canDelete, 403);
        abort_unless($resource->district_id === $user->district_id, 403);

        Storage::disk('public')->delete($resource->file_path);
        $resource->delete();

        return back()->with('message', 'Resource removed from library.');
    }
}
