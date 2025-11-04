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
        Schema::create('purchased_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->string('activation_id')->unique();
            $table->string('phone_number');
            $table->string('service_code');
            $table->string('country_code');
            $table->string('operator')->nullable();
            $table->decimal('cost', 10, 2);
            $table->integer('currency')->default(840); // ISO 4217
            $table->enum('status', ['waiting', 'received', 'cancelled', 'completed', 'expired'])->default('waiting');
            $table->string('otp_code')->nullable();
            $table->text('sms_text')->nullable();
            $table->timestamp('activation_time')->nullable();
            $table->timestamp('code_received_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('can_request_another_sms')->default(false);
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchased_numbers');
    }
};
