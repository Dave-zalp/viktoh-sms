<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchased_numbers', function (Blueprint $table) {
            // Drop UNIQUE index
            $table->dropUnique(['activation_id']);

            // Re-add as normal index (recommended)
            $table->index('activation_id');
        });
    }

    public function down(): void
    {
        Schema::table('purchased_numbers', function (Blueprint $table) {
            // Remove normal index
            $table->dropIndex(['activation_id']);

            // Restore UNIQUE constraint
            $table->unique('activation_id');
        });
    }
};
