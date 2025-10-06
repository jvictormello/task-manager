<?php

namespace Tests\Unit\Services;

use App\Contracts\Repositories\TaskRepositoryInterface;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Mockery;
use Tests\TestCase;

class TaskServiceTest extends TestCase
{
    private TaskRepositoryInterface $repository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = Mockery::mock(TaskRepositoryInterface::class);
    }

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_list_without_per_page_returns_collection(): void
    {
        $tasks = Task::factory()->count(2)->make();

        $this->repository->shouldReceive('all')->once()->andReturn($tasks);

        $service = new TaskService($this->repository);
        $result = $service->list();

        $this->assertInstanceOf(Collection::class, $result);
        $this->assertCount(2, $result);
    }

    public function test_list_with_per_page_returns_paginator(): void
    {
        $paginator = Mockery::mock(LengthAwarePaginator::class);

        $this->repository->shouldReceive('paginate')->with(15)->once()->andReturn($paginator);

        $service = new TaskService($this->repository);

        $this->assertSame($paginator, $service->list(15));
    }

    public function test_search_delegates_to_repository(): void
    {
        $filters = ['status' => TaskStatus::PENDING->value];
        $paginator = Mockery::mock(LengthAwarePaginator::class);

        $this->repository
            ->shouldReceive('search')
            ->with($filters, 'title', 'asc', 10)
            ->once()
            ->andReturn($paginator);

        $service = new TaskService($this->repository);

        $this->assertSame($paginator, $service->search($filters, 'title', 'asc', 10));
    }

    public function test_create_delegates_to_repository(): void
    {
        $data = [
            'title' => 'Delegate create',
            'description' => 'Check delegation',
            'status' => TaskStatus::IN_PROGRESS->value,
            'priority' => TaskPriority::HIGH->value,
            'due_date' => now()->addDay(),
        ];

        $task = Task::make($data);

        $this->repository->shouldReceive('create')->with($data)->once()->andReturn($task);

        $service = new TaskService($this->repository);

        $this->assertSame($task, $service->create($data));
    }

    public function test_find_delegates_to_repository(): void
    {
        $task = Task::factory()->make(['id' => 10]);

        $this->repository->shouldReceive('findOrFail')->with(10)->once()->andReturn($task);

        $service = new TaskService($this->repository);

        $this->assertSame($task, $service->find(10));
    }

    public function test_update_fetches_and_updates_task(): void
    {
        $existing = Task::factory()->make(['id' => 5]);
        $updated = Task::factory()->make(['id' => 5, 'title' => 'Updated']);
        $payload = ['title' => 'Updated'];

        $this->repository->shouldReceive('findOrFail')->with(5)->once()->andReturn($existing);
        $this->repository->shouldReceive('update')->with($existing, $payload)->once()->andReturn($updated);

        $service = new TaskService($this->repository);

        $this->assertSame('Updated', $service->update(5, $payload)->title);
    }

    public function test_delete_fetches_and_deletes_task(): void
    {
        $this->expectNotToPerformAssertions();
        $task = Task::factory()->make(['id' => 9]);

        $this->repository->shouldReceive('findOrFail')->with(9)->once()->andReturn($task);
        $this->repository->shouldReceive('delete')->with($task)->once();

        $service = new TaskService($this->repository);

        $service->delete(9);
    }

    public function test_statistics_fills_missing_status_and_priority_entries(): void
    {
        $rawStats = [
            'totalTasks' => 3,
            'byStatus' => [
                TaskStatus::PENDING->value => 2,
            ],
            'byPriority' => [
                TaskPriority::HIGH->value => 3,
            ],
        ];

        $this->repository->shouldReceive('getStatistics')->once()->andReturn($rawStats);

        $service = new TaskService($this->repository);

        $stats = $service->statistics();

        $this->assertSame(3, $stats['totalTasks']);
        $this->assertSame(2, $stats['byStatus'][TaskStatus::PENDING->value]);
        $this->assertSame(0, $stats['byStatus'][TaskStatus::IN_PROGRESS->value]);
        $this->assertSame(0, $stats['byStatus'][TaskStatus::COMPLETED->value]);
        $this->assertSame(0, $stats['byPriority'][TaskPriority::LOW->value]);
        $this->assertSame(0, $stats['byPriority'][TaskPriority::MEDIUM->value]);
        $this->assertSame(3, $stats['byPriority'][TaskPriority::HIGH->value]);
    }
}
