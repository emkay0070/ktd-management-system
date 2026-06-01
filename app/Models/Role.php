<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name', 'display_name', 'description'];

    /**
     * Users that belong to the role.
     */
    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('status', 'assigned_by', 'assigned_at')
            ->withTimestamps();
    }

    /**
     * Permissions that belong to this role.
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }
}
