<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassAssignment extends Model
{
    protected $fillable = [
        'pathfinder_id',
        'class_id',
    ];

    public function pathfinder(): BelongsTo
    {
        return $this->belongsTo(Pathfinder::class);
    }

    public function pathfinderClass(): BelongsTo
    {
        return $this->belongsTo(PathfinderClass::class, 'class_id');
    }
}

