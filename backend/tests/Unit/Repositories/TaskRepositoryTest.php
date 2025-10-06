<?php

namespace Tests\Unit\Repositories;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use App\Repositories\TaskRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\TestCase;

class TaskRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private TaskRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = new TaskRepository();
    }

    public function test_paginate_returns_tasks_ordered_by_latest(): void
    {
        Task::factory()->count(3)->sequence(
            ['title' => 'Task 1', 'created_at' => now()->subDays(3), 'updated_at' => now()->subDays(3)],
            ['title' => 'Task 2', 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)],
            ['title' => 'Task 3', 'created_at' => now()->subDay(), 'updated_at' => now()->subDay()],
        )->create();

        $result = $this->repository->paginate(2);

        $this->assertSame(['Task 3', 'Task 2'], $result->pluck('title')->all());
        $this->assertSame(3, $result->total());
    }

    public function test_all_returns_tasks_ordered_by_latest(): void
    {
        Task::factory()->count(3)->sequence(
            ['title' => 'Task A', 'created_at' => now()->subDays(3), 'updated_at' => now()->subDays(3)],
            ['title' => 'Task B', 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)],
            ['title' => 'Task C', 'created_at' => now()->subDay(), 'updated_at' => now()->subDay()],
        )->create();

        $result = $this->repository->all();

        $this->assertInstanceOf(Collection::class, $result);
        $this->assertSame(['Task C', 'Task B', 'Task A'], $result->pluck('title')->all());
    }

    public function test_create_persists_a_task(): void
    {
        $dueDate = now()->addDays(3);

        $task = $this->repository->create([
            'title' => 'New Task',
            'description' => 'Testing repository create',
            'status' => TaskStatus::IN_PROGRESS->value,
            'priority' => TaskPriority::HIGH->value,
            'due_date' => $dueDate,
        ]);

        $this->assertDatabaseCount('tasks', 1);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'New Task',
            'status' => TaskStatus::IN_PROGRESS->value,
            'priority' => TaskPriority::HIGH->value,
        ]);
    }

    public function test_find_or_fail_returns_task(): void
    {
        $task = Task::factory()->create(['title' => 'Lookup Task']);

        $found = $this->repository->findOrFail($task->id);

        $this->assertTrue($task->is($found));
    }

    public function test_update_modifies_given_task(): void
    {
        $task = Task::factory()->create([
            'title' => 'Original',
            'description' => 'Original description',
            'status' => TaskStatus::PENDING->value,
            'priority' => TaskPriority::LOW->value,
        ]);

        $updated = $this->repository->update($task, [
            'title' => 'Updated',
            'description' => 'Updated description',
            'status' => TaskStatus::COMPLETED->value,
            'priority' => TaskPriority::HIGH->value,
        ]);

        $this->assertSame('Updated', $updated->title);
        $this->assertSame(TaskStatus::COMPLETED, $updated->status);
        $this->assertSame(TaskPriority::HIGH, $updated->priority);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated',
            'status' => TaskStatus::COMPLETED->value,
            'priority' => TaskPriority::HIGH->value,
        ]);
    }

    public function test_delete_soft_deletes_task(): void
    {
        $task = Task::factory()->create();

        $this->repository->delete($task);

        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
    }

    public function test_get_statistics_returns_counts_for_status_and_priority(): void
    {
        Task::factory()->count(2)->create([
            'status' => TaskStatus::PENDING->value,
            'priority' => TaskPriority::MEDIUM->value,
        ]);
        Task::factory()->create([
            'status' => TaskStatus::IN_PROGRESS->value,
            'priority' => TaskPriority::LOW->value,
        ]);
        Task::factory()->create([
            'status' => TaskStatus::COMPLETED->value,
            'priority' => TaskPriority::HIGH->value,
        ]);

        $stats = $this->repository->getStatistics();

        $this->assertSame(4, $stats['totalTasks']);
        $this->assertEqualsCanonicalizing([
            TaskStatus::PENDING->value => 2,
            TaskStatus::IN_PROGRESS->value => 1,
            TaskStatus::COMPLETED->value => 1,
        ], $stats['byStatus']);
        $this->assertEqualsCanonicalizing([
            TaskPriority::LOW->value => 1,
            TaskPriority::MEDIUM->value => 2,
            TaskPriority::HIGH->value => 1,
        ], $stats['byPriority']);
    }

    public function test_search_filters_and_sorts_tasks(): void
    {
        Task::factory()->create(['title' => 'Alpha', 'status' => TaskStatus::PENDING->value]);
        Task::factory()->create(['title' => 'Beta', 'status' => TaskStatus::IN_PROGRESS->value]);
        Task::factory()->create(['title' => 'Gamma', 'status' => TaskStatus::COMPLETED->value]);

        $filtered = $this->repository->search(['status' => TaskStatus::IN_PROGRESS->value]);

        $filteredItems = $filtered->items();
        $this->assertCount(1, $filteredItems);
        $this->assertSame('Beta', $filteredItems[0]->title);

        $sorted = $this->repository->search(sortBy: 'title', sortDir: 'asc');

        // Repository sorts by title length first, then alpha
        $this->assertSame(['Beta', 'Alpha', 'Gamma'], collect($sorted->items())->pluck('title')->all());
    }

    public function test_search_can_return_paginator(): void
    {
        Task::factory()->count(4)->sequence(
            ['title' => 'Delta', 'created_at' => now()->subDays(4)],
            ['title' => 'Epsilon', 'created_at' => now()->subDays(3)],
            ['title' => 'Zeta', 'created_at' => now()->subDays(2)],
            ['title' => 'Eta', 'created_at' => now()->subDay()],
        )->create();

        $paginated = $this->repository->search(perPage: 2);

        $this->assertSame(4, $paginated->total());
        $this->assertSame(['Eta', 'Zeta'], collect($paginated->items())->pluck('title')->all());
    }
}
