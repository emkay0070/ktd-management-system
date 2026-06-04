<?php

namespace App\Http\Controllers;

use App\Models\DistrictResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DistrictResourceController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        $coordinatorRoles = [
            'district_curriculum_coordinator',
            'district_masterguide_coordinator',
            'district_communication_coordinator',
            'district_programs_coordinator',
            'district_music_coordinator',
            'district_welfare_coordinator',
            'district_pbe_coordinator'
        ];
        
        abort_unless($user && ($user->hasAnyRole(['district_director', 'district_committee', 'district_official', 'district_secretary']) || $user->hasAnyRole($coordinatorRoles)), 403);

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
        ]);

        return back()->with('message', 'Resource uploaded to district library.');
    }

    public function destroy(Request $request, DistrictResource $resource)
    {
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
