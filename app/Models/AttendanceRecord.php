<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    protected $fillable = [
        'attendance_session_id',
        'pathfinder_id',
        'master_guide_id',
        'is_present',
        'notes',
    ];

    protected $casts = [
        'is_present' => 'boolean',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    public function pathfinder(): BelongsTo
    {
        return $this->belongsTo(Pathfinder::class);
    }

    public function masterGuide(): BelongsTo
    {
        return $this->belongsTo(MasterGuide::class);
    }
}
