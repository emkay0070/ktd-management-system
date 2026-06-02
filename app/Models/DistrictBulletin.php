<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistrictBulletin extends Model
{
    protected $fillable = [
        'district_id', 'title', 'content', 'level', 'is_active', 'expires_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
