<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistrictResource extends Model
{
    protected $fillable = [
        'district_id', 'title', 'description', 'file_path', 'file_type', 'file_size', 'category', 'department', 'uploaded_by'
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
