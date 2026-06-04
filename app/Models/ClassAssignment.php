<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassAssignment extends Model
{
    protected $fillable = [
        'pathfinder_id',
        'class_id',
        'investiture_status',
        'investiture_recommendation_notes',
        'recommended_by',
        'recommended_at',
        'approved_by',
        'approved_at',
    ];

    public function pathfinder(): BelongsTo
    {
        return $this->belongsTo(Pathfinder::class);
    }

    public function pathfinderClass(): BelongsTo
    {
        return $this->belongsTo(PathfinderClass::class, 'class_id');
    }

    public function recommendedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recommended_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}

