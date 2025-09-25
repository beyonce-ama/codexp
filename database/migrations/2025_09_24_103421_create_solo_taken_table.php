<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('solo_taken', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->unsignedBigInteger('challenge_id')->index();

            // mirrors what you display in UI
            $t->enum('language', ['python','java'])->index();
            $t->enum('difficulty', ['easy','medium','hard'])->index();
            $t->enum('mode', ['fixbugs','random'])->index();

            // lifecycle/status
            // viewed = opened then closed without edits
            // started = edited (time_spent > 0 or code changed)
            // abandoned = left/closed without submitting
            // submitted_incorrect = submitted but failed
            // completed = exact match (passed)
            $t->enum('status', [
                'viewed','started','abandoned','submitted_incorrect','completed'
            ])->default('viewed')->index();

            $t->unsignedInteger('time_spent_sec')->default(0);
            $t->unsignedInteger('submit_count')->default(0);

            $t->float('last_similarity', 5, 4)->nullable(); // 0.0000 - 1.0000
            $t->integer('earned_xp')->default(0);

            $t->longText('code_submitted')->nullable();

            $t->timestamp('started_at')->nullable();
            $t->timestamp('ended_at')->nullable();

            // one row per user + challenge (latest state)
            $t->unique(['user_id','challenge_id']);
            $t->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('solo_taken');
    }
};
