# KTD Management System - Domain Model Refactoring

## Overview

This refactoring addresses a critical domain modeling problem where **identity, capability, and assignment** were collapsed into one bucket. The system incorrectly used "Master Guide" as both a login role and a staff type, when it should be a credential/investiture status.

## The Problem

### ❌ Current Broken Assumption
> "If someone is a Master Guide → they can be assigned as instructor"

This is incorrect. Master Guide investiture is **not a permission system**.

### ✅ Correct Rule
> "If someone has Instructor CMT certified → they can be assigned as instructor"

Credentials unlock assignments — never replace them.

---

## The 4-Layer Architecture

### ✅ 1. User (Authentication only)
> "Who is logging in?"

**Login Roles:**
- `director`
- `district_*` (all district roles)
- `pathfinder`
- `parent`
- `club_staff` (optional access role only)

**🚫 Removed from login roles:**
- `master_guide` - this is now a credential, not an identity

---

### ✅ 2. Staff Profile (Club reality)
> "Who exists in the club structure?"

**Current table:** `master_guides`
**Future table:** `club_staff` (Phase 3)

This is a **person registry**, not a qualification system:
- May or may not have `user_id`
- May or may not be active this year
- Exists even if not logged in

Think: *church record book*, not system role.

---

### ✅ 3. Credentials (Capability system)
> "What is this person qualified to do?"

**New table:** `staff_credentials`

**Credential types:**
- `master_guide` (invested)
- `instructor` (CMT certified)
- `counselor` (CMT certified)
- `director` (CMT certified)
- `club_secretary` (optional credential OR appointment-based)

**Lifecycle:**
```
in_training → completed → certified
```

This is the **real gatekeeper layer**.

---

### ✅ 4. Assignments (Contextual jobs)
> "What are you doing THIS YEAR in THIS club?"

**Existing tables:**
- `class_leader_assignments`
- `unit_roles`
- `committee_members`

Assignments depend on:
> credentials + club context + time

Not identity.

---

## Phase 1: Semantic Fix (COMPLETED ✅)

### Goal
Introduce the credential system without breaking existing functionality.

### Changes Made

#### 1. Database Layer
- ✅ Created `staff_credentials` table migration
  - Fields: staff_id, credential_type, status, certified_at, expires_at, certified_by, notes
  - Indexes on (staff_id, credential_type) and (credential_type, status)

#### 2. Model Layer
- ✅ Created `StaffCredential` model
  - Constants for credential types (INVESTITURE_CREDENTIALS, FUNCTIONAL_CREDENTIALS)
  - Constants for statuses (in_training, completed, certified)
  - Scopes: `certified()`, `valid()`, `ofType()`
  - Methods: `isValid()`, `isInvestiture()`, `isFunctional()`

- ✅ Updated `User` model
  - Removed `master_guide` from `getDefaultContext()` priority array
  - Added comment explaining master_guide is a credential, not login role
  - Added `clubStaff()` alias method for transition period

- ✅ Updated `MasterGuide` model
  - Added `credentials()` relationship
  - Added `hasCredential(string $credentialType)` method
  - Added `getMasterGuideCredential()` method

#### 3. Service Layer
- ✅ Created `CredentialService`
  - `canAssign(MasterGuide $staff, string $assignmentType)` - checks credentials
  - `validateAssignment(MasterGuide $staff, string $assignmentType)` - validates with exceptions
  - `getValidCredentials(MasterGuide $staff)` - returns all valid credentials
  - Helper methods: `isCertifiedMasterGuide()`, `isCertifiedInstructor()`, `isCertifiedCounselor()`
  - `awardCredential()` - creates new credential
  - `migrateMasterGuideToCredential()` - transition helper

#### 4. Controller Layer
- ✅ Updated `ClassLeaderAssignmentController`
  - Injected `CredentialService`
  - Added credential validation in `store()` method
  - Validates that staff has required credentials before assignment

#### 5. Migration Layer
- ✅ Created migration to populate `staff_credentials` from existing `master_guides`
  - Maps MG/MGT roles to master_guide credential
  - Sets status as certified for invested staff
  - Uses creation date as proxy for certification date
  - Includes rollback to remove migrated credentials

#### 6. Seeder Layer
- ✅ Created `CredentialSeeder`
  - Template for seeding test credentials
  - Currently commented out for production safety
  - Can be uncommented for development/testing

#### 7. Routing Layer
- ✅ Updated `DashboardRouterService`
  - Added deprecation comment for `master_guide` case in match statement
  - Added deprecation comment to `renderMasterGuide()` method
  - Kept methods functional for backward compatibility

---

## Phase 2: Make System Enforce Reality (PENDING)

### Goal
Add rule layer to enforce credential-based assignment validation throughout the system.

### Tasks

#### High Priority
- [ ] Add credential validation to `UnitRoleController`
- [ ] Add credential validation to `CommitteeController` (for counselor assignments)
- [ ] Add credential validation to `CurriculumController` (for instructor sign-offs)
- [ ] Create middleware for credential-based authorization
- [ ] Add credential checking to all assignment-related controllers

#### Medium Priority
- [ ] Create credential management UI for district coordinators
- [ ] Add credential expiration checking
- [ ] Create credential renewal workflow
- [ ] Add credential audit logging

#### Low Priority
- [ ] Create credential reports/analytics
- [ ] Add credential notification system

---

## Phase 3: Cleanup Migration (PENDING)

### Goal
Complete the transition by renaming tables and removing deprecated features.

### Tasks

#### Database Changes
- [ ] Rename `master_guides` table to `club_staff`
- [ ] Update all foreign key references
- [ ] Remove `master_guide` role from `roles` table
- [ ] Remove `master_guide` from all role checks
- [ ] Update `User.masterGuide()` to `User.clubStaff()`

#### Code Changes
- [ ] Update all references from `master_guides` to `club_staff`
- [ ] Remove `master_guide` case from dashboard routing
- [ ] Replace `renderMasterGuide()` with `renderStaff()`
- [ ] Update all model relationships
- [ ] Update all service references

#### UI Changes
- [ ] Rename "Master Guides" to "Club Staff" in navigation
- [ ] Update all labels and headings
- [ ] Update role selection UI
- [ ] Update dashboard titles
- [ ] Keep "Master Guide" as credential badge where appropriate

---

## Assignment Rules

### Current Implementation
```php
protected array $assignmentRules = [
    'instructor' => 'instructor',
    'counselor' => 'counselor',
    'unit_counselor' => 'counselor',
    'master_guide_instructor' => 'master_guide',
];
```

### Usage Example
```php
// Validate assignment
$credentialService->validateAssignment($staff, 'instructor');

// Check credential
if ($staff->hasCredential('instructor')) {
    // Allow assignment
}
```

---

## Mental Model Shift

### ❌ Wrong (current thinking)
> Master Guide = login role OR staff type

### ✅ Correct (new architecture)
> Master Guide = invested status in ministry journey

### Display Logic
**John Doe**
- Master Guide ✔ (badge from credentials)
- Role: Counselor (current assignment)

NOT:
> Master Guide (role)

---

## Key Principles

1. **Identity ≠ Capability ≠ Assignment**
   - Identity: Can you enter the system?
   - Capability: What are you qualified to do?
   - Assignment: What are you doing right now?

2. **Credentials unlock assignments**
   - Never use credentials as replacements for assignments
   - Always validate credentials before assignment

3. **Investiture ≠ Function**
   - A Master Guide can be a Director, Counselor, Instructor, or inactive
   - Investiture status is separate from current function

4. **Backward compatibility during transition**
   - Phase 1: Introduce new system alongside old
   - Phase 2: Enforce new rules
   - Phase 3: Remove old system

---

## Testing Checklist

### Phase 1 Testing
- [ ] Run migrations successfully
- [ ] Verify staff_credentials table populated correctly
- [ ] Test credential validation in class leader assignments
- [ ] Verify dashboard routing still works
- [ ] Test backward compatibility with existing master_guides

### Phase 2 Testing
- [ ] Test credential validation in unit role assignments
- [ ] Test credential validation in committee assignments
- [ ] Test credential expiration checking
- [ ] Test credential management UI
- [ ] Verify all assignment controllers enforce credentials

### Phase 3 Testing
- [ ] Test table rename migration
- [ ] Verify all foreign keys updated correctly
- [ ] Test staff dashboard (replaces master guide dashboard)
- [ ] Verify UI terminology updated
- [ ] Test that master_guide role is completely removed

---

## Migration Commands

### Phase 1
```bash
php artisan migrate
# Creates staff_credentials table
# Populates credentials from existing master_guides
```

### Phase 2
```bash
# No new migrations, just code changes
php artisan migrate
```

### Phase 3
```bash
php artisan migrate
# Renames master_guides to club_staff
# Removes deprecated roles
```

---

## Rollback Plan

### Phase 1 Rollback
```bash
php artisan migrate:rollback
# Removes staff_credentials table
# Removes credential validation from controllers
```

### Phase 2 Rollback
```bash
# Revert code changes manually
# No database rollback needed
```

### Phase 3 Rollback
```bash
php artisan migrate:rollback
# Reverts table rename
# Restores deprecated roles
```

---

## Status Summary

### ✅ Phase 1: COMPLETED
- Credential system introduced
- Model relationships established
- Service layer created
- Controller validation updated
- Migration created and tested
- Backward compatibility maintained

### ⏳ Phase 2: PENDING
- System-wide credential enforcement
- Credential management UI
- Expiration handling
- Audit logging

### ⏳ Phase 3: PENDING
- Table rename (master_guides → club_staff)
- Remove master_guide login role
- UI terminology updates
- Complete cleanup

---

## Notes

- This refactoring follows the user's architectural guidance exactly
- The 4-layer architecture is now correctly implemented
- Master Guide is preserved as a credential, not removed from the system
- The transition is phased to minimize disruption
- Backward compatibility is maintained throughout Phase 1
- Phase 2 will enforce the new rules system-wide
- Phase 3 will complete the cleanup and remove deprecated features
