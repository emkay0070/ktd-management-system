<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'description',
        'target_type',
        'target_id',
        'metadata',
        'ip_address',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * The user who performed the action.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic: the entity this action was performed on.
     */
    public function target()
    {
        if ($this->target_type && $this->target_id) {
            return $this->target_type::find($this->target_id);
        }
        return null;
    }
}
