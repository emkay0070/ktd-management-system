<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistrictTask extends Model
{
    protected $fillable = [
        'district_id', 'title', 'description', 'points', 'deadline', 'quarter', 'year', 'status'
    ];

    public function submissions()
    {
        return $this->hasMany(TaskSubmission::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
