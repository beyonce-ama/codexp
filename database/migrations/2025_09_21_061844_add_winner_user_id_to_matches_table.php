<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::table('matches', function (Blueprint $table) {
        $table->foreignId('winner_user_id')->nullable()->constrained('users')->onDelete('cascade');
        $table->timestamp('finished_at')->nullable();
    });
}

public function down()
{
    Schema::table('matches', function (Blueprint $table) {
        $table->dropForeign(['winner_user_id']);
        $table->dropColumn('winner_user_id');
        $table->dropColumn('finished_at');
    });
}
};
