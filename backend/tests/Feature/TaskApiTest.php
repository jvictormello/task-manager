<?php

namespace Tests\Feature;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_tasks_without_pagination(): void
    {
        Task::factory()->count(3)->sequence(
            ['title' => 'Alpha'],
            ['title' => 'Beta'],
            ['title' => 'Gamma'],
        )->create();

        $response = $this->getJson('/api/tasks');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure(['data', 'links', 'meta']);
        $this->assertSame(3, $response->json('meta.total'));
        $this->assertSame(10, $response->json('meta.per_page'));
        $this->assertSame(1, $response->json('meta.current_page'));
        $response->assertJsonFragment(['title' => 'Alpha']);
    }

    public function test_it_lists_tasks_with_pagination(): void
    {
        Task::factory()->count(4)->create();

        $response = $this->getJson('/api/tasks?per_page=2');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        $response->assertJsonStructure(['data', 'links', 'meta']);
        $this->assertSame(4, $response->json('meta.total'));
        $this->assertSame(2, $response->json('meta.per_page'));
    }

    public function test_it_creates_a_task(): void
    {
        $payload = [
            'title' => 'New task',
            'description' => 'Testing create endpoint',
            'status' => TaskStatus::IN_PROGRESS->value,
            'priority' => TaskPriority::HIGH->value,
            'due_date' => now()->addDay()->toISOString(),
        ];

        $response = $this->postJson('/api/tasks', $payload);

        $response->assertCreated();
        $response->assertJsonPath('data.title', 'New task');

        $this->assertDatabaseHas('tasks', [
            'title' => 'New task',
            'status' => TaskStatus::IN_PROGRESS->value,
            'priority' => TaskPriority::HIGH->value,
        ]);
    }

    public function test_it_shows_a_task(): void
    {
        $task = Task::factory()->create(['title' => 'Show me']);

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $task->id);
        $response->assertJsonPath('data.title', 'Show me');
    }

    public function test_it_updates_a_task(): void
    {
        $task = Task::factory()->create([
            'status' => TaskStatus::PENDING->value,
            'priority' => TaskPriority::LOW->value,
        ]);

        $payload = [
            'title' => 'Updated title',
            'status' => TaskStatus::COMPLETED->value,
            'priority' => TaskPriority::HIGH->value,
        ];

        $response = $this->putJson("/api/tasks/{$task->id}", $payload);

        $response->assertOk();
        $response->assertJsonPath('data.title', 'Updated title');

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated title',
            'status' => TaskStatus::COMPLETED->value,
            'priority' => TaskPriority::HIGH->value,
        ]);
    }

    public function test_it_deletes_a_task(): void
    {
        $task = Task::factory()->create();

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
    }

    public function test_it_returns_task_statistics(): void
    {
        Task::factory()->count(2)->create([
            'status' => TaskStatus::PENDING->value,
            'priority' => TaskPriority::MEDIUM->value,
        ]);
        Task::factory()->create([
            'status' => TaskStatus::COMPLETED->value,
            'priority' => TaskPriority::HIGH->value,
        ]);

        $response = $this->getJson('/api/tasks/statistics');

        $response->assertOk();
        $response->assertJsonPath('totalTasks', 3);
        $response->assertJsonPath('byStatus.'.TaskStatus::PENDING->value, 2);
        $response->assertJsonPath('byStatus.'.TaskStatus::IN_PROGRESS->value, 0);
        $response->assertJsonPath('byStatus.'.TaskStatus::COMPLETED->value, 1);
        $response->assertJsonPath('byPriority.'.TaskPriority::MEDIUM->value, 2);
        $response->assertJsonPath('byPriority.'.TaskPriority::HIGH->value, 1);
    }
}
