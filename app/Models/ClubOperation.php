<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClubOperation extends Model
{
    protected $fillable = [
        'church_id',
        'weekly_meeting_frequency',
        'departments',
    ];

    protected $casts = [
        'weekly_meeting_frequency' => 'integer',
        'departments' => 'array',
    ];

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }
}

