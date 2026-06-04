<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Pathfinder extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'father_name',
        'mother_name',
        'age',
        'gender',
        'phone',
        'guardian_name',
        'guardian_phone',
        'religion_id',
        'other_religion',
        'residence',
        'school_class',
        'is_inducted',
        'insured_yearly',
        'health_conditions',
        'medical_conditions',
        'medical_consent',
        'consent',
        'boarding_status',
        'church_id',
        'avatar_path',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        return $this->avatar_path ? asset('storage/' . $this->avatar_path) : null;
    }

    protected $casts = [
        'medical_consent' => 'boolean',
        'consent' => 'boolean',
        'is_inducted' => 'boolean',
        'insured_yearly' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'pending_parent_links', 'pathfinder_id', 'user_id')
            ->wherePivot('status', 'approved');
    }

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function classAssignment(): HasOne
    {
        return $this->hasOne(ClassAssignment::class);
    }

    public function assignedClass(): HasOneThrough
    {
        return $this->hasOneThrough(
            PathfinderClass::class,
            ClassAssignment::class,
            'pathfinder_id',
            'id',
            'id',
            'class_id',
        );
    }

    public function unitMembership(): HasOne
    {
        return $this->hasOne(UnitMember::class);
    }

    public function unit(): HasOneThrough
    {
        return $this->hasOneThrough(
            Unit::class,
            UnitMember::class,
            'pathfinder_id',
            'id',
            'id',
            'unit_id',
        );
    }

    public function religion(): BelongsTo
    {
        return $this->belongsTo(Religion::class);
    }

    public function timelineEvents(): HasMany
    {
        return $this->hasMany(TimelineEvent::class)->orderBy('event_date', 'desc');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(CurriculumProgress::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
