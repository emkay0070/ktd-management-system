<?php

namespace App\Http\Controllers;

use App\Models\MinistryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MinistryResourceController extends Controller
{
    public function index(Request $request)
    {
        $query = MinistryResource::query()->with('uploader:id,name');

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        $resources = $query->latest()->paginate(12);

        return Inertia::render('Resources/Index', [
            'resources' => $resources,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:20480', // 20MB
            'thumbnail' => 'nullable|image|max:2048',
            'category' => 'required|string',
            'visibility' => 'required|string|in:public,union,district,staff_only',
        ]);

        $filePath = $request->file('file')->store('resources/files', 'public');
        $thumbnailPath = $request->hasFile('thumbnail') 
            ? $request->file('thumbnail')->store('resources/thumbnails', 'public') 
            : null;

        MinistryResource::create([
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $filePath,
            'thumbnail_path' => $thumbnailPath,
            'file_type' => $request->file('file')->getMimeType(),
            'file_size' => $request->file('file')->getSize(),
            'category' => $request->category,
            'visibility' => $request->visibility,
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('message', 'Resource uploaded successfully.');
    }

    public function download(MinistryResource $resource)
    {
        $resource->increment('downloads_count');
        return Storage::disk('public')->download($resource->file_path, $resource->title);
    }
}
