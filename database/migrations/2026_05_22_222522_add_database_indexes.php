<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_offers', function (Blueprint $table) {
            $table->index('company_id');
            $table->index('status');
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->index('job_offer_id');
            $table->index('status');
            $table->index('candidate_id');
        });

        Schema::table('notes', function (Blueprint $table) {
            $table->index('application_id');
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::table('job_offers', function (Blueprint $table) {
            $table->dropIndex(['company_id']);
            $table->dropIndex(['status']);
        });
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex(['job_offer_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['candidate_id']);
        });
        Schema::table('notes', function (Blueprint $table) {
            $table->dropIndex(['application_id']);
        });
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropIndex(['email']);
        });
    }
};
