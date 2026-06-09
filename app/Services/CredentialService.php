<?php

namespace App\Services;

use App\Models\MasterGuide;
use App\Models\StaffCredential;
use Illuminate\Validation\ValidationException;

class CredentialService
{
    /**
     * Assignment rules: which credentials are required for which assignments.
     *
     * Key: assignment type
     * Value: required credential type
     */
    protected array $assignmentRules = [
        'instructor' => 'instructor',
        'counselor' => 'counselor',
        'unit_counselor' => 'counselor',
        'master_guide_instructor' => 'master_guide', // Only invested MGs can teach MG classes
    ];

    /**
     * Check if a staff member can be assigned to a specific role.
     *
     * @param MasterGuide $staff The staff member
     * @param string $assignmentType The type of assignment (e.g., 'instructor', 'counselor')
     * @return bool
     */
    public function canAssign(MasterGuide $staff, string $assignmentType): bool
    {
        // If no credential is required for this assignment type, allow it
        if (!isset($this->assignmentRules[$assignmentType])) {
            return true;
        }

        $requiredCredential = $this->assignmentRules[$assignmentType];
        return $staff->hasCredential($requiredCredential);
    }

    /**
     * Validate assignment and throw exception if credentials are missing.
     *
     * @param MasterGuide $staff The staff member
     * @param string $assignmentType The type of assignment
     * @throws ValidationException
     */
    public function validateAssignment(MasterGuide $staff, string $assignmentType): void
    {
        if (!$this->canAssign($staff, $assignmentType)) {
            $requiredCredential = $this->assignmentRules[$assignmentType] ?? 'unknown';
            throw ValidationException::withMessages([
                'staff_id' => "This assignment requires the '{$requiredCredential}' credential. " .
                            "The staff member does not have a valid certification for this credential."
            ]);
        }
    }

    /**
     * Get all valid credentials for a staff member.
     *
     * @param MasterGuide $staff
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getValidCredentials(MasterGuide $staff)
    {
        return $staff->credentials()->valid()->get();
    }

    /**
     * Check if a staff member is a certified Master Guide.
     *
     * @param MasterGuide $staff
     * @return bool
     */
    public function isCertifiedMasterGuide(MasterGuide $staff): bool
    {
        return $staff->hasCredential('master_guide');
    }

    /**
     * Check if a staff member is a certified Instructor.
     *
     * @param MasterGuide $staff
     * @return bool
     */
    public function isCertifiedInstructor(MasterGuide $staff): bool
    {
        return $staff->hasCredential('instructor');
    }

    /**
     * Check if a staff member is a certified Counselor.
     *
     * @param MasterGuide $staff
     * @return bool
     */
    public function isCertifiedCounselor(MasterGuide $staff): bool
    {
        return $staff->hasCredential('counselor');
    }

    /**
     * Award a credential to a staff member.
     *
     * @param MasterGuide $staff
     * @param string $credentialType
     * @param string $status
     * @param int|null $certifiedBy
     * @return StaffCredential
     */
    public function awardCredential(
        MasterGuide $staff,
        string $credentialType,
        string $status = StaffCredential::STATUS_CERTIFIED,
        ?int $certifiedBy = null
    ): StaffCredential {
        return StaffCredential::create([
            'staff_id' => $staff->id,
            'credential_type' => $credentialType,
            'status' => $status,
            'certified_at' => $status === StaffCredential::STATUS_CERTIFIED ? now() : null,
            'certified_by' => $certifiedBy,
        ]);
    }

    /**
     * Migrate existing Master Guide role to credential system.
     * This is used during the transition phase.
     *
     * @param MasterGuide $staff
     * @return void
     */
    public function migrateMasterGuideToCredential(MasterGuide $staff): void
    {
        // Only migrate if they don't already have the credential
        if (!$staff->hasCredential('master_guide')) {
            // If they have role = 'MG' or 'MGT', consider them certified
            if (in_array($staff->role, ['MG', 'MGT'])) {
                $this->awardCredential($staff, 'master_guide', StaffCredential::STATUS_CERTIFIED);
            }
        }
    }
}
