<?php

namespace Database\Seeders;

use App\Models\StaffCredential;
use Illuminate\Database\Seeder;

class CredentialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder adds sample credentials for testing the new credential system.
     * In production, credentials should be awarded through the proper certification process.
     */
    public function run(): void
    {
        // Note: This seeder is for development/testing purposes.
        // In production, credentials are awarded through the certification workflow,
        // not seeded directly.

        // Example: Award credentials to existing staff members
        // This would typically be done through the CredentialService
        // during the migration process or through the certification workflow.

        // Uncomment and customize for testing:
        /*
        $staffMembers = \App\Models\MasterGuide::all();

        foreach ($staffMembers as $staff) {
            // Award Master Guide credential to those with MG/MGT role
            if (in_array($staff->role, ['MG', 'MGT'])) {
                StaffCredential::firstOrCreate([
                    'staff_id' => $staff->id,
                    'credential_type' => 'master_guide',
                ], [
                    'status' => StaffCredential::STATUS_CERTIFIED,
                    'certified_at' => now()->subMonths(rand(1, 24)),
                    'notes' => 'Seeded for testing',
                ]);
            }

            // Randomly assign instructor/counselor credentials for testing
            if (rand(0, 1)) {
                StaffCredential::firstOrCreate([
                    'staff_id' => $staff->id,
                    'credential_type' => 'instructor',
                ], [
                    'status' => StaffCredential::STATUS_CERTIFIED,
                    'certified_at' => now()->subMonths(rand(1, 12)),
                    'notes' => 'Seeded for testing',
                ]);
            }

            if (rand(0, 1)) {
                StaffCredential::firstOrCreate([
                    'staff_id' => $staff->id,
                    'credential_type' => 'counselor',
                ], [
                    'status' => StaffCredential::STATUS_CERTIFIED,
                    'certified_at' => now()->subMonths(rand(1, 12)),
                    'notes' => 'Seeded for testing',
                ]);
            }
        }
        */

        $this->command->info('CredentialSeeder completed. Uncomment the code above to seed test credentials.');
    }
}
