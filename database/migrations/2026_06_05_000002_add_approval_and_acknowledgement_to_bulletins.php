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
        Schema::table('district_bulletins', function (Blueprint $table) {
            $table->boolean('requires_acknowledgement')->default(false)->after('target_audience');
            $table->foreignId('approved_by')->nullable()->after('author_id')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });

        Schema::create('bulletin_acknowledgements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bulletin_id')->constrained('district_bulletins')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('church_id')->nullable()->constrained('churches')->nullOnDelete();
            $table->timestamp('acknowledged_at');
            $table->timestamps();

            $table->unique(['bulletin_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bulletin_acknowledgements');
        Schema::table('district_bulletins', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['requires_acknowledgement', 'approved_by', 'approved_at']);
        });
    }
};
