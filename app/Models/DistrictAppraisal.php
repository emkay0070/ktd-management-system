<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistrictAppraisal extends Model
{
    protected $fillable = [
        'district_id', 'church_id', 'quarter', 'year', 
        'score_technical', 'score_admin', 'score_activities', 'total_score', 'comments'
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function church()
    {
        return $this->belongsTo(Church::class);
    }
}
