<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HonorCalendarSession extends Model
{
    protected $fillable = [
        'district_id',
        'honour_id',
        'session_type',
        'scheduled_date',
        'location',
        'instructor_id',
        'target_audience',
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function honour()
    {
        return $this->belongsTo(Honour::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}
