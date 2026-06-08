<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DistrictEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'district_id',
        'name',
        'type',
        'description',
        'start_date',
        'end_date',
        'location',
        'operational_status',
        'workflow_status',
        'message_type',
        'registration_fee',
        'approved_by',
        'approved_at',
    ];

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
