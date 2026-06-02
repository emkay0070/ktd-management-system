<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurriculumRequirement extends Model
{
    protected $fillable = [
        'class_id',
        'title',
        'description',
        'category',
    ];

    public function pathfinderClass()
    {
        return $this->belongsTo(PathfinderClass::class, 'class_id');
    }

    public function progress()
    {
        return $this->hasMany(CurriculumProgress::class, 'requirement_id');
    }
}
