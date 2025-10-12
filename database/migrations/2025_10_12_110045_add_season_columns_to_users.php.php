<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $t) {
            $t->unsignedInteger('season_xp')->default(0)->after('total_xp');
            $t->unsignedInteger('season_stars')->default(0)->after('season_xp');
            $t->unsignedInteger('crowns')->default(0)->after('season_stars');
            $t->unsignedBigInteger('last_season_id')->nullable()->after('crowns');
            $t->unsignedInteger('last_season_rank')->nullable()->after('last_season_id');
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $t) {
            $t->dropColumn(['season_xp','season_stars','crowns','last_season_id','last_season_rank']);
        });
    }
};
