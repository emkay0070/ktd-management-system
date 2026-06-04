<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistrictBulletin extends Model
{
    protected $fillable = [
        'district_id', 'title', 'content', 'level', 'workflow_status', 'message_type', 'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
