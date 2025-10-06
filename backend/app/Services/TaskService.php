<?php

namespace App\Services;

use App\Contracts\Repositories\TaskRepositoryInterface;
use App\Contracts\Services\TaskServiceInterface;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TaskService implements TaskServiceInterface
{
    /**
     * @param TaskRepositoryInterface $tasks Repository dependency
     */
    public function __construct(private readonly TaskRepositoryInterface $tasks) {}

    /**
     * List tasks either paginated or as a collection.
     *
     * @param int|null $perPage Number of items per page; null to return full collection
     * @return LengthAwarePaginator|Collection
     */
    public function list(?int $perPage = null): LengthAwarePaginator|Collection
    {
        if ($perPage === null) {
            return $this->tasks->all();
        }

        return $this->tasks->paginate($perPage);
    }

    /**
     * List with filters and sorting.
     *
     * @param array $filters
     * @param string|null $sortBy
     * @param string $sortDir
     * @param int|null $perPage
     * @return LengthAwarePaginator|Collection
     */
    public function search(array $filters = [], ?string $sortBy = null, string $sortDir = 'desc', ?int $perPage = null): LengthAwarePaginator|Collection
    {
        return $this->tasks->search($filters, $sortBy, $sortDir, $perPage);
    }

    /**
     * Create a new task.
     *
     * @param array $data
     * @return Task
     */
    public function create(array $data): Task
    {
        return $this->tasks->create($data);
    }

    /**
     * Find a task by id.
     *
     * @param int $id
     * @return Task
     */
    public function find(int $id): Task
    {
        return $this->tasks->findOrFail($id);
    }

    /**
     * Update a task by id with provided data.
     *
     * @param int   $id
     * @param array $data
     * @return Task
     */
    public function update(int $id, array $data): Task
    {
        $task = $this->find($id);

        return $this->tasks->update($task, $data);
    }

    /**
     * Delete a task by id.
     *
     * @param int $id
     * @return void
     */
    public function delete(int $id): void
    {
        $task = $this->find($id);

        $this->tasks->delete($task);
    }

    /**
     * Compute statistics for tasks.
     *
     * @return array{totalTasks:int,byStatus:array<string,int>,byPriority:array<string,int>}
     */
    public function statistics(): array
    {
        $stats = $this->tasks->getStatistics();

        $statusCounts = collect(TaskStatus::cases())
            ->mapWithKeys(fn (TaskStatus $status) => [$status->value => $stats['byStatus'][$status->value] ?? 0])
            ->toArray();

        $priorityCounts = collect(TaskPriority::cases())
            ->mapWithKeys(fn (TaskPriority $priority) => [$priority->value => $stats['byPriority'][$priority->value] ?? 0])
            ->toArray();

        return [
            'totalTasks' => $stats['totalTasks'],
            'byStatus' => $statusCounts,
            'byPriority' => $priorityCounts,
        ];
    }
}
