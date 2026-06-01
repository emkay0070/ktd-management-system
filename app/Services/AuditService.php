<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Log a user action to the activity log.
     *
     * @param  string       $action       machine-readable action: 'approved_parent_link'
     * @param  string       $description  human-readable: 'Approved link between Jane and John'
     * @param  object|null  $target       Eloquent model that was acted on
     * @param  array        $metadata     extra key/value context
     */
    public static function log(
        string  $action,
        string  $description = '',
        object  $target      = null,
        array   $metadata    = []
    ): ActivityLog {
        return ActivityLog::create([
            'user_id'     => Auth::id(),
            'action'      => $action,
            'description' => $description,
            'target_type' => $target ? get_class($target) : null,
            'target_id'   => $target?->id,
            'metadata'    => empty($metadata) ? null : $metadata,
            'ip_address'  => Request::ip(),
        ]);
    }

    /**
     * Retrieve the latest log entries with optional filters.
     */
    public static function recent(int $limit = 50, ?int $userId = null): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::with('user')
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->latest()
            ->limit($limit)
            ->get();
    }
}
