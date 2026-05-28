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
        Schema::table('candidates', function (Blueprint $table) {
            $table->enum('sex', ['male', 'female'])->nullable()->after('phone');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->enum('sex', ['male', 'female'])->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn('sex');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('sex');
        });
    }
};
