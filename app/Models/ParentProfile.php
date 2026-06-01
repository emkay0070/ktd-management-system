<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParentProfile extends Model
{
    protected $fillable = ['user_id', 'is_master_guide', 'club_role'];

    protected $casts = [
        'is_master_guide' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
