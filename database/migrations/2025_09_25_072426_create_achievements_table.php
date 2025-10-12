<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('achievements', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();                 // e.g. SOLO_10
            $t->string('name');                           // e.g. "Solo Rookie"
            $t->string('description')->nullable();        // e.g. "Complete 10 Training challenges"
            $t->enum('scope', ['SOLO','AI','PVP','LANG'])->default('SOLO');
            $t->unsignedInteger('threshold')->default(0); // e.g. 10
            $t->string('icon_key', 64)->nullable();       // e.g. "trophy-bronze"
            $t->unsignedInteger('xp_reward')->default(0);
            $t->unsignedInteger('stars_reward')->default(0);
            $t->boolean('enabled')->default(true);
            $t->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('achievements');
    }
};
