<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('virtual_accounts', function (Blueprint $table) {
            $table->dropUnique(['customer_id']);
            $table->dropUnique(['reserved_account_id']);

            $table->string('customer_id')->nullable()->change();
            $table->string('reserved_account_id')->nullable()->change();
            $table->string('bank_code')->nullable()->change();
            $table->string('customer_name')->nullable()->change();
            $table->string('customer_email')->nullable()->change();
            $table->string('customer_phone_number')->nullable()->change();

            $table->string('provider')->default('paymentpoint')->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('virtual_accounts', function (Blueprint $table) {
            $table->dropColumn('provider');

            $table->string('customer_id')->nullable(false)->change();
            $table->string('reserved_account_id')->nullable(false)->change();
            $table->string('bank_code')->nullable(false)->change();
            $table->string('customer_name')->nullable(false)->change();
            $table->string('customer_email')->nullable(false)->change();
            $table->string('customer_phone_number')->nullable(false)->change();

            $table->unique('customer_id');
            $table->unique('reserved_account_id');
        });
    }
};
