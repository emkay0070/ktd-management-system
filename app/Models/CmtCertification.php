<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmtCertification extends Model
{
    protected $fillable = [
        'user_id',
        'certification_type',
        'status',
        'completed_at',
        'certified_by',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function certifier()
    {
        return $this->belongsTo(User::class, 'certified_by');
    }
}
