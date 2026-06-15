<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CommunicationAttachment extends Model
{
    protected $fillable = [
        'message_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    protected $appends = ['url'];

    public function message(): BelongsTo
    {
        return $this->belongsTo(CommunicationMessage::class, 'message_id');
    }

    public function getUrlAttribute(): string
    {
        $disk = env('AWS_ACCESS_KEY_ID') ? 's3' : 'public';
        return Storage::disk($disk)->url($this->file_path);
    }
}
