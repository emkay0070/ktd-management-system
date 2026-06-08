<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurriculumAudit extends Model
{
    protected $fillable = [
        'district_id',
        'church_id',
        'audited_by',
        'audit_date',
        'teaching_quality_score',
        'record_keeping_score',
        'facilities_score',
        'comments',
        'recommendations',
    ];

    protected $casts = [
        'audit_date' => 'date',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function auditor()
    {
        return $this->belongsTo(User::class, 'audited_by');
    }
}
