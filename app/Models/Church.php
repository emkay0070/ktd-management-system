<?php

namespace App\Models;

use App\Traits\HasCommunicationChannels;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Church extends Model
{
    use HasFactory, HasCommunicationChannels;

    protected $fillable = ['name', 'location', 'district_id', 'status', 'is_school'];

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function pathfinders(): HasMany
    {
        return $this->hasMany(Pathfinder::class);
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    public function masterGuides(): HasMany
    {
        return $this->hasMany(MasterGuide::class);
    }

    public function committees(): HasMany
    {
        return $this->hasMany(Committee::class);
    }

    public function clubOperation(): HasOne
    {
        return $this->hasOne(ClubOperation::class);
    }
}
