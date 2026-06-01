<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitteeMember extends Model
{
    protected $fillable = [
        'committee_id',
        'user_id',
        'pathfinder_id',
        'master_guide_id',
        'role',
    ];

    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pathfinder(): BelongsTo
    {
        return $this->belongsTo(Pathfinder::class);
    }

    public function masterGuide(): BelongsTo
    {
        return $this->belongsTo(MasterGuide::class);
    }
}

