<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistrictBulletin extends Model
{
    protected $fillable = [
        'district_id', 'author_id', 'approved_by', 'approved_at', 'title', 'content', 'level', 'workflow_status', 'message_type', 'department', 'target_audience', 'requires_acknowledgement', 'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'approved_at' => 'datetime',
        'requires_acknowledgement' => 'boolean',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function acknowledgements()
    {
        return $this->hasMany(BulletinAcknowledgement::class, 'bulletin_id');
    }
}
