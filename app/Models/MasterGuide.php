<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterGuide extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'role',
        'church_id',
        'assigned_class_id',
        'religion_id',
        'other_religion',
        'residence',
        'occupation_status',
        'insured_yearly',
        'actively_teaching',
        'responsibility',
        'other_church_responsibility',
        'avatar_path',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        return $this->avatar_path ? asset('storage/' . $this->avatar_path) : null;
    }

    protected $casts = [
        'actively_teaching' => 'boolean',
        'insured_yearly' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }

    public function assignedClass(): BelongsTo
    {
        return $this->belongsTo(PathfinderClass::class, 'assigned_class_id');
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(MgTraining::class);
    }

    /**
     * Credentials held by this staff member.
     * This represents what they are qualified to do (Master Guide, Instructor, Counselor, etc.).
     */
    public function credentials(): HasMany
    {
        return $this->hasMany(StaffCredential::class, 'staff_id');
    }

    /**
     * Check if this staff member has a specific valid credential.
     */
    public function hasCredential(string $credentialType): bool
    {
        return $this->credentials()
            ->where('credential_type', $credentialType)
            ->valid()
            ->exists();
    }

    /**
     * Get the Master Guide credential if it exists and is valid.
     */
    public function getMasterGuideCredential()
    {
        return $this->credentials()
            ->where('credential_type', 'master_guide')
            ->valid()
            ->first();
    }

    public function religion(): BelongsTo
    {
        return $this->belongsTo(Religion::class);
    }
}
