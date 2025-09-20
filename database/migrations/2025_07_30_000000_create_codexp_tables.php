<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /**
         * Ensure users table exists first.
         * - If missing, create it with common Laravel columns + role enum.
         * - If present, just normalize its `role` column.
         */
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->enum('status', ['active', 'inactive'])->default('active'); // ✅ Added status
                $table->enum('role', ['admin','participant'])->default('participant');
                $table->rememberToken();
                $table->timestamps();
            });
        } else {
            // Normalize any stray roles before converting the column type
            if (Schema::hasColumn('users', 'role')) {
                DB::table('users')->whereNotIn('role', ['admin','participant'])->update(['role' => 'participant']);
                // Convert to ENUM (MySQL/MariaDB). If you're on a different driver, swap to VARCHAR + CHECK.
                DB::statement("ALTER TABLE `users` MODIFY `role` ENUM('admin','participant') NOT NULL DEFAULT 'participant'");
            } else {
                // If role column doesn't exist yet, add it
                Schema::table('users', function (Blueprint $table) {
                    $table->enum('role', ['admin','participant'])->default('participant')->after('password');
                });
            }
        }

        // -------------------- 9 GAME TABLES --------------------

        // 1) user_profiles
        if (!Schema::hasTable('user_profiles')) {
            Schema::create('user_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
                $table->string('username', 50)->unique();
                $table->string('avatar_url')->nullable();
                $table->boolean('music_enabled')->default(true);
                $table->boolean('sound_enabled')->default(true);
                $table->timestamps();
            });
        }

        // 2) characters
        if (!Schema::hasTable('characters')) {
            Schema::create('characters', function (Blueprint $table) {
                $table->id();
                $table->string('name', 50);
                $table->string('asset_idle')->nullable();
                $table->string('asset_happy')->nullable();
                $table->string('asset_sad')->nullable();
                $table->string('asset_thinking')->nullable();
                $table->timestamps();
            });
        }

        // 3) challenges_solo (upload JSON here for Solo: fixbugs/random)
        if (!Schema::hasTable('challenges_solo')) {
            Schema::create('challenges_solo', function (Blueprint $table) {
                $table->id();
                $table->enum('mode', ['fixbugs','random'])->default('fixbugs');
                $table->enum('language', ['python','java'])->index();
                $table->enum('difficulty', ['easy','medium','hard'])->index();
                $table->string('title', 200);
                $table->text('description')->nullable();
                $table->longText('buggy_code')->nullable();
                $table->longText('fixed_code')->nullable();
                $table->longText('hint')->nullable();
                $table->json('payload_json')->nullable();  // store full JSON
                $table->string('source_file')->nullable(); // original filename
                $table->decimal('reward_xp', 6, 2)->default(2.00); // Solo default
                $table->timestamps();
                $table->index(['mode','language','difficulty']);
            });
        }

        // 4) challenges_1v1 (upload JSON here for 1v1)
        if (!Schema::hasTable('challenges_1v1')) {
            Schema::create('challenges_1v1', function (Blueprint $table) {
                $table->id();
                $table->enum('language', ['python','java'])->index();
                $table->enum('difficulty', ['easy','medium','hard'])->index();
                $table->string('title', 200);
                $table->text('description')->nullable();
                $table->longText('buggy_code')->nullable();
                $table->longText('fixed_code')->nullable();
                $table->json('payload_json')->nullable();
                $table->string('source_file')->nullable();
                $table->timestamps();
                $table->index(['language','difficulty']);
            });
        }

        // 5) solo_attempts
        if (!Schema::hasTable('solo_attempts')) {
            Schema::create('solo_attempts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('challenge_id')->constrained('challenges_solo')->cascadeOnDelete();
                $table->enum('language', ['python','java'])->index();
                $table->enum('mode', ['fixbugs','random'])->index();
                $table->integer('time_spent_sec')->default(0);
                $table->boolean('is_correct')->default(false);
                $table->longText('code_submitted')->nullable();
                $table->text('judge_feedback')->nullable();
                $table->decimal('xp_earned', 6, 2)->default(0.00);
                $table->integer('stars_earned')->default(0);
                $table->timestamps();
                $table->index(['user_id','challenge_id']);
            });
        }

        // 6) duels (instead of "matches" to avoid MySQL MATCH keyword)
        if (!Schema::hasTable('duels')) {
            Schema::create('duels', function (Blueprint $table) {
                $table->id();
                $table->foreignId('challenger_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('opponent_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('challenge_id')->nullable()->constrained('challenges_1v1')->nullOnDelete();
                $table->enum('language', ['python','java'])->index();
                $table->enum('status', ['pending','active','finished','surrendered','cancelled'])->default('pending');
                $table->timestamp('started_at')->nullable();
                $table->timestamp('ended_at')->nullable();
                $table->foreignId('winner_id')->nullable()->constrained('users')->nullOnDelete();
                $table->integer('duration_sec')->default(0);
                $table->decimal('winner_xp', 6, 2)->default(2.00); // per spec
                $table->integer('winner_stars')->default(1);
                $table->timestamps();
                $table->timestamp('challenger_started_at')->nullable();
    $table->timestamp('opponent_started_at')->nullable();
    $table->timestamp('challenger_started_at')->nullable()->after('started_at');
        $table->timestamp('opponent_started_at')->nullable()->after('challenger_started_at');
                $table->index(['challenger_id','opponent_id']);
            });
        }

        // 7) duel_submissions
        if (!Schema::hasTable('duel_submissions')) {
            Schema::create('duel_submissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('duel_id')->constrained('duels')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->longText('code_submitted')->nullable();
                $table->boolean('is_correct')->default(false);
                $table->text('judge_feedback')->nullable();
                $table->integer('time_spent_sec')->default(0);
                $table->timestamps();
                $table->index(['duel_id','user_id']);
            });
        }

        // 8) user_language_stats
        if (!Schema::hasTable('user_language_stats')) {
            Schema::create('user_language_stats', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->enum('language', ['python','java']);
                $table->unsignedInteger('games_played')->default(0);
                $table->unsignedInteger('wins')->default(0);
                $table->unsignedInteger('losses')->default(0);
                $table->decimal('winrate', 6, 3)->default(0.000);
                $table->unsignedInteger('solo_completed')->default(0);
                $table->timestamps();
                $table->unique(['user_id','language']);
            });
        }

        // 9) feedback
        if (!Schema::hasTable('feedback')) {
            Schema::create('feedback', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->enum('type', ['issue','feedback','feature','report'])->default('feedback');
                $table->string('title', 200);
                $table->text('message');
                $table->enum('status', ['open','in_progress','resolved','closed'])->default('open');
                $table->timestamps();
            });

            
        }
        
    }

    public function down(): void
    {
        // Drop 9 game tables in reverse order
        Schema::dropIfExists('feedback');
        Schema::dropIfExists('user_language_stats');
        Schema::dropIfExists('duel_submissions');
        Schema::dropIfExists('duels');
        Schema::dropIfExists('solo_attempts');
        Schema::dropIfExists('challenges_1v1');
        Schema::dropIfExists('challenges_solo');
        Schema::dropIfExists('characters');
        Schema::dropIfExists('user_profiles');

        // If we created users in this migration (fresh DB), you can optionally drop it:
        // Schema::dropIfExists('users');
  Schema::table('duels', function (Blueprint $table) {
        $table->dropColumn(['challenger_started_at', 'opponent_started_at']);
    });
        // If users existed before, and we changed role to ENUM, you can revert:
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role')) {
            try {
                DB::statement("ALTER TABLE `users` MODIFY `role` VARCHAR(50) NOT NULL DEFAULT 'participant'");
            } catch (\Throwable $e) {
                // noop on non-MySQL drivers
            }
        }
    }
};
