<?php

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title', 100);
            $table->string('description', 500);
            $table->enum('status', array_column(TaskStatus::cases(), 'value'))->default(TaskStatus::PENDING->value);
            $table->enum('priority', array_column(TaskPriority::cases(), 'value'))->default(TaskPriority::MEDIUM->value);
            $table->timestampTz('due_date');
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('status');
            $table->index('priority');
            $table->index('due_date');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
