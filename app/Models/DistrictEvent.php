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
        'status',
        'registration_fee',
        'is_published',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_published' => 'boolean',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
