<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE communication_channels DROP CONSTRAINT IF EXISTS communication_channels_type_check");
        DB::statement("ALTER TABLE communication_channels ADD CONSTRAINT communication_channels_type_check CHECK (type IN ('direct', 'class', 'unit', 'club', 'district', 'union', 'public', 'group'))");
        DB::statement("ALTER TABLE communication_channels ALTER COLUMN type SET DEFAULT 'club'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE communication_channels DROP CONSTRAINT IF EXISTS communication_channels_type_check");
        DB::statement("ALTER TABLE communication_channels ADD CONSTRAINT communication_channels_type_check CHECK (type IN ('direct', 'class', 'unit', 'club', 'district', 'union', 'public'))");
        DB::statement("ALTER TABLE communication_channels ALTER COLUMN type SET DEFAULT 'club'");
    }
};
