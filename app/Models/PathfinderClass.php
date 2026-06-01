<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PathfinderClass extends Model
{
    protected $table = 'classes';

    protected $fillable = [
        'name',
    ];

    public function assignments(): HasMany
    {
        return $this->hasMany(ClassAssignment::class, 'class_id');
    }

    public function leaderAssignments(): HasMany
    {
        return $this->hasMany(ClassLeaderAssignment::class, 'class_id');
    }
}

