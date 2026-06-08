<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('district_resources', function (Blueprint $table) {
            $table->string('workflow_status')->default('draft')->after('category');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('district_resources', function (Blueprint $table) {
            $table->dropColumn(['workflow_status', 'approved_by', 'approved_at']);
        });
    }
};
