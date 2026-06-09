<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffCredential extends Model
{
    protected $fillable = [
        'staff_id',
        'credential_type',
        'status',
        'certified_at',
        'expires_at',
        'certified_by',
        'notes',
    ];

    protected $casts = [
        'certified_at' => 'date',
        'expires_at' => 'date',
    ];

    /**
     * Credential types that represent investiture milestones
     */
    public const INVESTITURE_CREDENTIALS = [
        'master_guide',
    ];

    /**
     * Credential types that represent functional certifications
     */
    public const FUNCTIONAL_CREDENTIALS = [
        'instructor',
        'counselor',
        'director',
        'club_secretary',
    ];

    /**
     * All valid credential types
     */
    public const VALID_TYPES = [
        'master_guide',
        'instructor',
        'counselor',
        'director',
        'club_secretary',
    ];

    /**
     * Credential statuses
     */
    public const STATUS_IN_TRAINING = 'in_training';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CERTIFIED = 'certified';

    public const VALID_STATUSES = [
        self::STATUS_IN_TRAINING,
        self::STATUS_COMPLETED,
        self::STATUS_CERTIFIED,
    ];

    /**
     * The staff member this credential belongs to.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(MasterGuide::class, 'staff_id');
    }

    /**
     * The user who certified this credential.
     */
    public function certifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'certified_by');
    }

    /**
     * Check if this credential is currently valid (not expired).
     */
    public function isValid(): bool
    {
        if ($this->status !== self::STATUS_CERTIFIED) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Check if this credential is an investiture credential.
     */
    public function isInvestiture(): bool
    {
        return in_array($this->credential_type, self::INVESTITURE_CREDENTIALS);
    }

    /**
     * Check if this credential is a functional credential.
     */
    public function isFunctional(): bool
    {
        return in_array($this->credential_type, self::FUNCTIONAL_CREDENTIALS);
    }

    /**
     * Scope to get only certified credentials.
     */
    public function scopeCertified($query)
    {
        return $query->where('status', self::STATUS_CERTIFIED);
    }

    /**
     * Scope to get only valid (certified and not expired) credentials.
     */
    public function scopeValid($query)
    {
        return $query->where('status', self::STATUS_CERTIFIED)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            });
    }

    /**
     * Scope to get credentials of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('credential_type', $type);
    }
}
