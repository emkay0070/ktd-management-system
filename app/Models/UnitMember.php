<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitMember extends Model
{
    protected $fillable = [
        'unit_id',
        'pathfinder_id',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function pathfinder(): BelongsTo
    {
        return $this->belongsTo(Pathfinder::class);
    }
}

