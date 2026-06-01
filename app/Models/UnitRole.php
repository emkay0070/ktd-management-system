<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitRole extends Model
{
    protected $fillable = [
        'unit_id',
        'captain_id',
        'scribe_id',
        'counselor_id',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function captain(): BelongsTo
    {
        return $this->belongsTo(Pathfinder::class, 'captain_id');
    }

    public function scribe(): BelongsTo
    {
        return $this->belongsTo(Pathfinder::class, 'scribe_id');
    }

    public function counselor(): BelongsTo
    {
        return $this->belongsTo(MasterGuide::class, 'counselor_id');
    }
}

