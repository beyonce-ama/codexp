<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('match_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('match_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->longText('code');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();

            // optional FKs if your tables exist / you want constraints
            // $table->foreign('match_id')->references('id')->on('matches')->onDelete('cascade');
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
    public function down(): void {
        Schema::dropIfExists('match_submissions');
    }
};
