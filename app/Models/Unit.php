<?php

namespace App\Models;

use App\Traits\HasCommunicationChannels;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Unit extends Model
{
    use HasCommunicationChannels;

    protected $fillable = [
        'name',
        'gender',
        'church_id',
    ];

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(UnitMember::class);
    }

    public function pathfinders(): BelongsToMany
    {
        return $this->belongsToMany(Pathfinder::class, 'unit_members');
    }

    public function roles(): HasOne
    {
        return $this->hasOne(UnitRole::class);
    }
}

