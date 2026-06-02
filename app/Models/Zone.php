<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
{
    protected $fillable = ['name', 'conference_id'];

    public function conference(): BelongsTo
    {
        return $this->belongsTo(Conference::class);
    }

    public function districts(): HasMany
    {
        return $this->hasMany(District::class);
    }
}
