<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Union extends Model
{
    protected $fillable = ['name'];

    public function conferences(): HasMany
    {
        return $this->hasMany(Conference::class);
    }
}
