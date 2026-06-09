<?php

namespace App\Models;

use App\Traits\HasCommunicationChannels;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    use HasFactory, HasCommunicationChannels;


    protected $fillable = ['conference_id', 'zone_id', 'name'];

    public function conference()
    {
        return $this->belongsTo(Conference::class);
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function churches()
    {
        return $this->hasMany(Church::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function events()
    {
        return $this->hasMany(DistrictEvent::class);
    }

    public function tasks()
    {
        return $this->hasMany(DistrictTask::class);
    }

    public function resources()
    {
        return $this->hasMany(DistrictResource::class);
    }

    public function bulletins()
    {
        return $this->hasMany(DistrictBulletin::class);
    }

    public function appraisals()
    {
        return $this->hasMany(DistrictAppraisal::class);
    }
}
