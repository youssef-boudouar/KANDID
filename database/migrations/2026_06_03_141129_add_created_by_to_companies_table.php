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
        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('id');
        });

        // Backfill: assign the earliest user of each company as its creator
        \DB::table('companies')->get()->each(function ($company) {
            $firstUser = \DB::table('users')
                ->where('company_id', $company->id)
                ->orderBy('id')
                ->first();
            if ($firstUser) {
                \DB::table('companies')->where('id', $company->id)->update(['created_by' => $firstUser->id]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('created_by');
        });
    }
};
