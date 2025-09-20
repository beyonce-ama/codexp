<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $t) {
        $t->id();
        $t->string('language');
        $t->string('difficulty');
        $t->string('status')->default('matched'); // matched|running|finished
        $t->longText('challenge_json')->nullable(); // frozen problem
        $t->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
