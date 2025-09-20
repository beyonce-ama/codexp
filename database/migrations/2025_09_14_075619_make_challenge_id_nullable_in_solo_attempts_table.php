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
    Schema::table('solo_attempts', function (Blueprint $table) {
        $table->foreignId('challenge_id')->nullable()->change();
    });
}

public function down()
{
    Schema::table('solo_attempts', function (Blueprint $table) {
        $table->foreignId('challenge_id')->nullable(false)->change();
    });
}
};
