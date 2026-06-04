<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialEvent extends Model
{
    protected $fillable = [
        'district_id', 'title', 'description', 'event_date', 
        'category', 'status', 'budget', 'attendance_count', 'created_by'
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'budget' => 'decimal:2',
    ];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
