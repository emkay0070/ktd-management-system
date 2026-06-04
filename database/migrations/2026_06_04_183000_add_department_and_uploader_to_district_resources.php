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
            $table->string('department')->nullable()->after('category');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('district_resources', function (Blueprint $table) {
            $table->dropForeign(['uploaded_by']);
            $table->dropColumn(['department', 'uploaded_by']);
        });
    }
};
