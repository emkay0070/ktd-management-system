<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_guides', function (Blueprint $table) {
            $table->foreignId('religion_id')->nullable()->after('assigned_class_id')->constrained('religions')->nullOnDelete();
            $table->string('other_religion')->nullable()->after('religion_id');
            $table->string('residence')->nullable()->after('other_religion');
            $table->string('occupation_status')->nullable()->after('residence'); // working, schooling, unemployed
            $table->text('other_church_responsibility')->nullable()->after('responsibility');
            $table->boolean('insured_yearly')->default(false)->after('occupation_status');
        });
    }

    public function down(): void
    {
        Schema::table('master_guides', function (Blueprint $table) {
            $table->dropConstrainedForeignId('religion_id');
            $table->dropColumn([
                'other_religion',
                'residence',
                'occupation_status',
                'other_church_responsibility',
                'insured_yearly',
            ]);
        });
    }
};

