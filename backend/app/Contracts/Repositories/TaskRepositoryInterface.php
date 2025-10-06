<?php

namespace App\Contracts\Repositories;

use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface TaskRepositoryInterface
{
    /**
     * Return paginated tasks ordered by latest first.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator;

    /**
     * Create a new task.
     *
     * @param array $data
     * @return Task
     */
    public function create(array $data): Task;

    /**
     * Find a task by id or throw a 404 exception.
     *
     * @param int $id
     * @return Task
     */
    public function findOrFail(int $id): Task;

    /**
     * Update the given task with data and return the fresh model.
     *
     * @param Task  $task
     * @param array $data
     * @return Task
     */
    public function update(Task $task, array $data): Task;

    /**
     * Delete the given task.
     *
     * @param Task $task
     * @return void
     */
    public function delete(Task $task): void;

    /**
     * Return aggregated statistics for tasks grouped by status and priority.
     *
     * @return array{totalTasks:int,byStatus:array<string,int>,byPriority:array<string,int>}
     */
    public function getStatistics(): array;

    /**
     * Return all tasks (non-paginated), ordered by latest first.
     *
     * @return \Illuminate\Support\Collection<int, Task>
     */
    public function all(): Collection;

    /**
     * Search, filter and sort tasks.
     *
     * @param array $filters Key-value filters
     * @param string|null $sortBy One of id,title,created_at,updated_at,due_date
     * @param string $sortDir asc|desc
     * @param int|null $perPage null to return full collection
     * @return LengthAwarePaginator|Collection
     */
    public function search(array $filters = [], ?string $sortBy = null, string $sortDir = 'desc', ?int $perPage = null): LengthAwarePaginator|Collection;
}
