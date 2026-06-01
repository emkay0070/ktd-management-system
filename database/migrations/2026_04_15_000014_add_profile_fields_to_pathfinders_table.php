<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pathfinders', function (Blueprint $table) {
            $table->string('father_name')->nullable()->after('name');
            $table->string('mother_name')->nullable()->after('father_name');
            $table->foreignId('religion_id')->nullable()->after('guardian_phone')->constrained('religions')->nullOnDelete();
            $table->string('other_religion')->nullable()->after('religion_id');
            $table->string('residence')->nullable()->after('other_religion');
            $table->string('school_class')->nullable()->after('residence');
            $table->boolean('is_inducted')->default(false)->after('school_class');
            $table->boolean('insured_yearly')->default(false)->after('is_inducted');
        });
    }

    public function down(): void
    {
        Schema::table('pathfinders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('religion_id');
            $table->dropColumn([
                'father_name',
                'mother_name',
                'other_religion',
                'residence',
                'school_class',
                'is_inducted',
                'insured_yearly',
            ]);
        });
    }
};

