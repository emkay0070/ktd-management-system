<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimelineEvent extends Model
{
    protected $fillable = [
        'pathfinder_id',
        'title',
        'description',
        'icon',
        'event_date',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];

    public function pathfinder()
    {
        return $this->belongsTo(Pathfinder::class);
    }
}
