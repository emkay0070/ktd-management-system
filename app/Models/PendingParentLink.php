<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingParentLink extends Model
{
    protected $fillable = ['user_id', 'pathfinder_id', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pathfinder()
    {
        return $this->belongsTo(Pathfinder::class);
    }
}
