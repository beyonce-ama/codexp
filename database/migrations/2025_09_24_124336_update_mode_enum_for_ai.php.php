<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('solo_taken', function (Blueprint $table) {
            $table->enum('mode', ['fixbugs','random','aigenerated'])->default('fixbugs')->change();
        });

        // If other tables also have `mode`, repeat:
        // Schema::table('solo_challenges', fn (Blueprint $t) => $t->enum('mode', ['fixbugs','random','aigenerated'])->default('fixbugs')->change());
        // Schema::table('solo_attempts', fn (Blueprint $t) => $t->enum('mode', ['fixbugs','random','aigenerated'])->default('fixbugs')->change());
    }

    public function down(): void
    {
        Schema::table('solo_taken', function (Blueprint $table) {
            $table->enum('mode', ['fixbugs','random'])->default('fixbugs')->change();
        });
        // …repeat for other tables if you changed them above
    }
};
