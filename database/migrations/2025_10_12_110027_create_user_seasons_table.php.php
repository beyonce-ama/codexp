<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_seasons', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedBigInteger('season_id');
            $t->unsignedBigInteger('user_id');
            $t->unsignedInteger('season_xp')->default(0);
            $t->unsignedInteger('season_stars')->default(0);
            $t->unsignedInteger('final_rank')->nullable();
            $t->boolean('is_champion')->default(false);
            $t->timestamp('snapshot_at')->nullable();
            $t->timestamps();

            $t->unique(['season_id','user_id']);
            $t->foreign('season_id')->references('season_id')->on('seasons')->cascadeOnDelete();
            $t->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('user_seasons'); }
};
