<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Honour extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'level',
        'description',
        'patch_path',
    ];

    /**
     * Pathfinders who have earned this honour.
     */
    public function pathfinders(): BelongsToMany
    {
        return $this->belongsToMany(Pathfinder::class, 'pathfinder_honour')
            ->withPivot('status', 'earned_at', 'verified_by')
            ->withTimestamps();
    }
}
