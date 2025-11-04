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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('purchased_number_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['debit', 'credit', 'refund']); // debit: money out, credit: money in
            $table->decimal('amount', 10, 2);
            $table->decimal('balance_before', 10, 2);
            $table->decimal('balance_after', 10, 2);
            $table->string('description');
            $table->string('reference')->nullable(); // Activation ID or payment reference
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
            $table->index(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
