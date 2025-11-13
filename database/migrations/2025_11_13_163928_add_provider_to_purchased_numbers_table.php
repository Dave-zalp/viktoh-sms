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
        Schema::table('purchased_numbers', function (Blueprint $table) {
            //
            $table->string('provider')->default('smsactivate'); // 'smsactivate' or 'daisysms'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchased_numbers', function (Blueprint $table) {
            //
        });
    }
};
