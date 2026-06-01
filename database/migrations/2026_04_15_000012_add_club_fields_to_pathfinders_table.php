<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pathfinders', function (Blueprint $table) {
            $table->string('guardian_name')->nullable()->after('gender');
            $table->string('guardian_phone')->nullable()->after('guardian_name');
            $table->text('medical_conditions')->nullable()->after('health_conditions');
            $table->boolean('consent')->default(false)->after('medical_conditions');
        });
    }

    public function down(): void
    {
        Schema::table('pathfinders', function (Blueprint $table) {
            $table->dropColumn(['guardian_name', 'guardian_phone', 'medical_conditions', 'consent']);
        });
    }
};

