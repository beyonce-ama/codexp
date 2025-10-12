<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('seasons', function (Blueprint $t) {
            $t->bigIncrements('season_id');
            $t->string('code', 20)->unique();    // e.g., S1, S2...
            $t->string('name', 100);             // Season 1, etc.
            $t->timestamp('starts_at');
            $t->timestamp('ends_at');
            $t->boolean('is_active')->default(true)->index();
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('seasons'); }
};
