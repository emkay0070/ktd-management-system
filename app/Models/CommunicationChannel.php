<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CommunicationChannel extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'model_id',
        'model_type',
        'created_by',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($channel) {
            if (empty($channel->slug)) {
                $channel->slug = Str::slug($channel->name ?? 'channel-' . Str::random(8));
            }
        });
    }

    public function model(): MorphTo
    {
        return $this->morphTo();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(CommunicationParticipant::class, 'channel_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'communication_participants', 'channel_id', 'user_id')
            ->withPivot(['last_read_at', 'is_muted', 'role'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(CommunicationMessage::class, 'channel_id');
    }

    public function lastMessage()
    {
        return $this->hasOne(CommunicationMessage::class, 'channel_id')->latestOfMany();
    }
}
