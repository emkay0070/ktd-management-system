<?php

namespace App\Models;

use App\Traits\HasCommunicationChannels;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Union extends Model
{
    use HasFactory, HasCommunicationChannels;

    protected $fillable = ['name'];

    public function conferences(): HasMany
    {
        return $this->hasMany(Conference::class);
    }
}
