<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskSubmission extends Model
{
    protected $fillable = [
        'district_task_id', 'church_id', 'evidence_path', 'feedback', 'status', 'points_awarded'
    ];

    public function task()
    {
        return $this->belongsTo(DistrictTask::class, 'district_task_id');
    }

    public function church()
    {
        return $this->belongsTo(Church::class);
    }
}
