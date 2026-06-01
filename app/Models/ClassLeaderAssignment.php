<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassLeaderAssignment extends Model
{
    protected $fillable = [
        'class_id',
        'master_guide_id',
        'role',
    ];

    public function pathfinderClass(): BelongsTo
    {
        return $this->belongsTo(PathfinderClass::class, 'class_id');
    }

    public function masterGuide(): BelongsTo
    {
        return $this->belongsTo(MasterGuide::class);
    }
}

