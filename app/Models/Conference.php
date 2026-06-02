<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conference extends Model
{
    protected $fillable = ['name', 'union_id'];

    public function union()
    {
        return $this->belongsTo(Union::class);
    }

    public function zones()
    {
        return $this->hasMany(Zone::class);
    }

    public function districts()
    {
        return $this->hasMany(District::class);
    }
}
