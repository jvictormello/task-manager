<?php

namespace Database\Factories;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(2),
            'status' => $this->faker->randomElement(TaskStatus::cases())->value,
            'priority' => $this->faker->randomElement(TaskPriority::cases())->value,
            'due_date' => $this->faker->dateTimeBetween('+1 day', '+1 month'),
            'created_at' => $this->faker->dateTimeBetween('-1 month', '-1 day'),
            'updated_at' => now(),
        ];
    }

    public function pending(): self
    {
        return $this->state(fn () => ['status' => TaskStatus::PENDING->value]);
    }

    public function inProgress(): self
    {
        return $this->state(fn () => ['status' => TaskStatus::IN_PROGRESS->value]);
    }

    public function completed(): self
    {
        return $this->state(fn () => ['status' => TaskStatus::COMPLETED->value]);
    }

    public function lowPriority(): self
    {
        return $this->state(fn () => ['priority' => TaskPriority::LOW->value]);
    }

    public function mediumPriority(): self
    {
        return $this->state(fn () => ['priority' => TaskPriority::MEDIUM->value]);
    }

    public function highPriority(): self
    {
        return $this->state(fn () => ['priority' => TaskPriority::HIGH->value]);
    }
}

