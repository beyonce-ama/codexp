<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('ai_attempts')->default(0)->after('remember_token');
            $table->integer('ai_successful_attempts')->default(0)->after('ai_attempts');
            $table->decimal('total_xp', 10, 2)->default(0)->after('ai_successful_attempts');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ai_attempts', 'ai_successful_attempts', 'total_xp']);
        });
    }
};