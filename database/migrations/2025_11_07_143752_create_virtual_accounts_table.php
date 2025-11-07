<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('virtual_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('customer_id')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone_number');
            $table->string('business_id')->nullable();
            $table->string('bank_code');
            $table->string('account_number')->unique();
            $table->string('account_name');
            $table->string('bank_name');
            $table->string('reserved_account_id')->unique();
            $table->timestamps();

            $table->index('user_id');
            $table->index('account_number');
            $table->index('account_name');
            $table->index('bank_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('virtual_accounts');
    }
};
