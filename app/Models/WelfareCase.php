<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WelfareCase extends Model
{
    protected $fillable = [
        'district_id', 'church_id', 'user_id', 'beneficiary_name', 
        'category', 'description', 'status', 'support_provided', 
        'follow_up_notes', 'created_by'
    ];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
