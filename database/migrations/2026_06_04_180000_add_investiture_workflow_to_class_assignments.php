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
        Schema::table('class_assignments', function (Blueprint $table) {
            $table->string('investiture_status')->default('not_ready');
            // not_ready, pending_review, recommended, approved, invested
            
            $table->text('investiture_recommendation_notes')->nullable();
            
            $table->foreignId('recommended_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('recommended_at')->nullable();
            
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_assignments', function (Blueprint $table) {
            $table->dropForeign(['recommended_by']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'investiture_status',
                'investiture_recommendation_notes',
                'recommended_by',
                'recommended_at',
                'approved_by',
                'approved_at'
            ]);
        });
    }
};
