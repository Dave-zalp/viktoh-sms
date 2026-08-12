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
        Schema::table('servicesettings_models', function (Blueprint $table) {
            $table->decimal('grizzly_sms_exc_rate', 10, 2)->default(1500);
            $table->decimal('grizzly_sms_top_up', 10, 8)->default(60);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('servicesettings_models', function (Blueprint $table) {
            $table->dropColumn(['grizzly_sms_exc_rate', 'grizzly_sms_top_up']);
        });
    }
};
