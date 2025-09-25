<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('solo_taken', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id'); // Just a regular bigInteger, no foreign key
            $table->bigInteger('challenge_id'); // Just a regular bigInteger, no foreign key
            
            $table->string('language');
            $table->string('difficulty');
            $table->string('status');
            $table->integer('earned_xp')->default(0);
            $table->integer('time_spent_sec')->default(0);
            $table->text('code_submitted')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            // Add regular indexes for better performance
            $table->index('user_id');
            $table->index('challenge_id');
            $table->index('status');
            $table->index(['user_id', 'challenge_id']); // Composite index
        });
    }

    public function down()
    {
        Schema::dropIfExists('solo_taken');
    }
};