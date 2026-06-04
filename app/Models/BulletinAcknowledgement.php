<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BulletinAcknowledgement extends Model
{
    protected $fillable = [
        'bulletin_id', 'user_id', 'church_id', 'acknowledged_at'
    ];

    protected $casts = [
        'acknowledged_at' => 'datetime',
    ];

    public function bulletin()
    {
        return $this->belongsTo(DistrictBulletin::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function church()
    {
        return $this->belongsTo(Church::class);
    }
}
