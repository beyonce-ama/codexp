<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_achievements', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('achievement_id')->constrained()->cascadeOnDelete();
            $t->timestamp('unlocked_at')->nullable();
            $t->timestamp('notified_at')->nullable(); // optional for toasts
            $t->unique(['user_id','achievement_id']);
            $t->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_achievements');
    }
};
