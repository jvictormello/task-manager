<?php

namespace App\Contracts\Services;

use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface TaskServiceInterface
{
    /**
     * List tasks either paginated or in full.
     *
     * @param int|null $perPage Items per page; null returns full collection
     * @return LengthAwarePaginator|Collection
     */
    public function list(?int $perPage = null): LengthAwarePaginator|Collection;

    /**
     * Create a new task.
     *
     * @param array $data
     * @return Task
     */
    public function create(array $data): Task;

    /**
     * Find a task by id, or fail.
     *
     * @param int $id
     * @return Task
     */
    public function find(int $id): Task;

    /**
     * Update a task by id.
     *
     * @param int   $id
     * @param array $data
     * @return Task
     */
    public function update(int $id, array $data): Task;

    /**
     * Delete a task by id.
     *
     * @param int $id
     * @return void
     */
    public function delete(int $id): void;

    /**
     * Return aggregated statistics for tasks.
     *
     * @return array{totalTasks:int,byStatus:array<string,int>,byPriority:array<string,int>}
     */
    public function statistics(): array;
}
