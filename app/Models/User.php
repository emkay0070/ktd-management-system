<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'church_id',
        'district_id',
        'avatar_path',
    ];

    protected $appends = ['avatar_url', 'role_names', 'permission_names', 'role'];

    /**
     * Fallback for legacy $user->role checks.
     */
    public function getRoleAttribute(): string
    {
        return $this->active_context;
    }

    /**
     * Active context role (for multi-role switcher). Stored in session.
     */
    public function getActiveContextAttribute(): ?string
    {
        return session('active_role_context') ?? $this->getDefaultContext();
    }

    protected function getDefaultContext(): string
    {
        $priority = ['super_admin', 'district_official', 'director', 'master_guide', 'pathfinder', 'parent', 'observer'];
        foreach ($priority as $role) {
            if ($this->hasRole($role)) return $role;
        }
        return 'observer';
    }

    /**
     * Roles that belong to the user.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class)
            ->withPivot('status', 'assigned_by', 'assigned_at', 'entity_type', 'entity_id')
            ->withTimestamps();
    }

    /**
     * Check if user has a specific role (by name).
     */
    public function hasRole($role)
    {
        return $this->roles()->where('roles.name', $role)->wherePivot('status', 'active')->exists();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole($roles)
    {
        return $this->roles()
            ->whereIn('roles.name', (array)$roles)
            ->wherePivot('status', 'active')
            ->exists();
    }

    /**
     * Get a list of the user's active role names.
     */
    public function getRoleNamesAttribute(): array
    {
        return $this->roles()->wherePivot('status', 'active')->pluck('name')->toArray();
    }

    /**
     * Get all unique permission names across all active roles.
     */
    public function getPermissionNamesAttribute(): array
    {
        return $this->getAllPermissions();
    }

    /**
     * Return all permission names for this user (cached per request).
     */
    public function getAllPermissions(): array
    {
        static $cache = [];
        $key = $this->id;
        if (isset($cache[$key])) return $cache[$key];

        $perms = $this->roles()
            ->wherePivot('status', 'active')
            ->with('permissions')
            ->get()
            ->flatMap(fn($role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->toArray();

        $cache[$key] = $perms;
        return $perms;
    }

    /**
     * Check if user has a specific permission (via any active role).
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->getAllPermissions());
    }

    /**
     * Get the church that the user belongs to.
     */
    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    /**
     * Get the district that the user belongs to.
     */
    public function district()
    {
        return $this->belongsTo(District::class);
    }

    /**
     * Get the associated pathfinder profile if any.
     */
    public function pathfinder()
    {
        return $this->hasOne(Pathfinder::class);
    }

    /**
     * Get the associated master guide profile if any.
     */
    public function masterGuide()
    {
        return $this->hasOne(MasterGuide::class);
    }

    /**
     * Get the parent profile if user is a parent.
     */
    public function parentProfile()
    {
        return $this->hasOne(ParentProfile::class);
    }

    /**
     * Get the children (pathfinders) linked to this parent.
     */
    public function children()
    {
        return $this->belongsToMany(Pathfinder::class, 'pending_parent_links')
            ->wherePivot('status', 'approved');
    }

    /**
     * Get all pending link requests for this parent.
     */
    public function pendingLinks()
    {
        return $this->hasMany(PendingParentLink::class)->where('status', 'pending');
    }

    /**
     * Get the full URL for the user's avatar.
     */
    public function getAvatarUrlAttribute()
    {
        return $this->avatar_path ? asset('storage/' . $this->avatar_path) : null;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
