<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('matches', function (Blueprint $table) {
            if (!Schema::hasColumn('matches','finished_at')) {
                $table->timestamp('finished_at')->nullable()->after('status');
            }
        });
    }
    public function down(): void {
        Schema::table('matches', function (Blueprint $table) {
            if (Schema::hasColumn('matches','finished_at')) {
                $table->dropColumn('finished_at');
            }
        });
    }
};
