<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    protected $fillable = [
        'pathfinder_id', 
        'district_event_id', 
        'church_id', 
        'paid', 
        'amount_paid', 
        'status', 
        'notes', 
        'verified_by'
    ];

    public function pathfinder()
    {
        return $this->belongsTo(Pathfinder::class);
    }

    public function event()
    {
        return $this->belongsTo(DistrictEvent::class, 'district_event_id');
    }

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
