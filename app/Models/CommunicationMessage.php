<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunicationMessage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'channel_id',
        'sender_id',
        'content',
        'type',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function channel(): BelongsTo
    {
        return $this->belongsTo(CommunicationChannel::class, 'channel_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(CommunicationAttachment::class, 'message_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(CommunicationReaction::class, 'message_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CommunicationComment::class, 'message_id');
    }
}
