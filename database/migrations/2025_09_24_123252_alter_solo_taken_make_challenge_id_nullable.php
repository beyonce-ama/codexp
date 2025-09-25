<?php

// database/migrations/xxxx_xx_xx_make_solo_taken_challenge_id_nullable.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('solo_taken', function (Blueprint $table) {
            // keep existing FK, only change nullability
            $table->unsignedBigInteger('challenge_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('solo_taken', function (Blueprint $table) {
            $table->unsignedBigInteger('challenge_id')->nullable(false)->change();
        });
    }
};
