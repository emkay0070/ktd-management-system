<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conferences', function (Blueprint $table) {
            $table->foreignId('union_id')->nullable()->constrained()->cascadeOnDelete();
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->foreignId('zone_id')->nullable()->constrained()->cascadeOnDelete();
        });

        Schema::table('role_user', function (Blueprint $table) {
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            
            // Drop old unique constraint
            $table->dropUnique(['user_id', 'role_id']);
            
            // Add new unique constraint
            $table->unique(['user_id', 'role_id', 'entity_type', 'entity_id'], 'role_user_entity_unique');
        });
    }

    public function down(): void
    {
        Schema::table('role_user', function (Blueprint $table) {
            $table->dropUnique('role_user_entity_unique');
            $table->unique(['user_id', 'role_id']);
            $table->dropColumn(['entity_type', 'entity_id']);
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->dropForeign(['zone_id']);
            $table->dropColumn('zone_id');
        });

        Schema::table('conferences', function (Blueprint $table) {
            $table->dropForeign(['union_id']);
            $table->dropColumn('union_id');
        });
    }
};
