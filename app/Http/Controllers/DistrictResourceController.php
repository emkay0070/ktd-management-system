<?php

namespace App\Http\Controllers;

use App\Models\DistrictResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DistrictResourceController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();
        abort_unless($user && in_array($user->role, ['district_director', 'district_committee']), 403);

        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
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
        ]);

        return back()->with('message', 'Resource uploaded to district library.');
    }

    public function destroy(DistrictResource $resource)
    {
        $user = auth()->user();
        abort_unless($user && $user->role === 'district_director', 403);
        abort_unless($resource->district_id === $user->district_id, 403);

        Storage::disk('public')->delete($resource->file_path);
        $resource->delete();

        return back()->with('message', 'Resource removed from library.');
    }
}
