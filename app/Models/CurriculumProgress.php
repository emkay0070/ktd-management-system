<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurriculumProgress extends Model
{
    protected $fillable = [
        'pathfinder_id',
        'requirement_id',
        'completed_at',
        'verified_by',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function pathfinder()
    {
        return $this->belongsTo(Pathfinder::class);
    }

    public function requirement()
    {
        return $this->belongsTo(CurriculumRequirement::class, 'requirement_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
