<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Religion extends Model
{
    protected $fillable = [
        'name',
        'church_id',
    ];

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function pathfinders(): HasMany
    {
        return $this->hasMany(Pathfinder::class);
    }

    public function masterGuides(): HasMany
    {
        return $this->hasMany(MasterGuide::class);
    }
}

