<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MgTraining extends Model
{
    protected $table = 'mg_training';

    protected $fillable = [
        'master_guide_id',
        'training_start_date',
        'expected_completion_date',
        'status',
        'assigned_mentor_id',
    ];

    protected $casts = [
        'training_start_date' => 'date',
        'expected_completion_date' => 'date',
    ];

    public function masterGuide(): BelongsTo
    {
        return $this->belongsTo(MasterGuide::class);
    }

    public function assignedMentor(): BelongsTo
    {
        return $this->belongsTo(MasterGuide::class, 'assigned_mentor_id');
    }
}

