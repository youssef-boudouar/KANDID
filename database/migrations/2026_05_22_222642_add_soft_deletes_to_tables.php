<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_offers',   fn(Blueprint $t) => $t->softDeletes());
        Schema::table('applications', fn(Blueprint $t) => $t->softDeletes());
        Schema::table('companies',    fn(Blueprint $t) => $t->softDeletes());
    }

    public function down(): void
    {
        Schema::table('job_offers',   fn(Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('applications', fn(Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('companies',    fn(Blueprint $t) => $t->dropSoftDeletes());
    }
};
