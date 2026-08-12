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
        Schema::create('servicesettings_models', function (Blueprint $table) {
            $table->id();
            $table->decimal('sms_activate_exc_rate', 10, 2)->default(1500);
            $table->decimal('sms_activate_top_up', 10,8)->default(60);
            $table->decimal('daisy_sms_exc_rate', 10, 2)->default(1500);
            $table->decimal('daisy_sms_top_up', 10,8)->default(60);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servicesettings_models');
    }
};
