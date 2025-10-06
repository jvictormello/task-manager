<?php

namespace App\Repositories;

use App\Contracts\Repositories\TaskRepositoryInterface;
use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Builder;

class TaskRepository implements TaskRepositoryInterface
{
    /**
     * Return paginated tasks ordered by latest first.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Task::query()->orderByDesc('created_at')->paginate($perPage);
    }

    /**
     * Return all tasks ordered by latest first.
     *
     * @return \Illuminate\Support\Collection<int, Task>
     */
    public function all(): Collection
    {
        return Task::query()->orderByDesc('created_at')->get();
    }

    /**
     * Create a new task.
     *
     * @param array $data
     * @return Task
     */
    public function create(array $data): Task
    {
        return Task::create($data);
    }

    /**
     * Find a task by id or fail.
     *
     * @param int $id
     * @return Task
     */
    public function findOrFail(int $id): Task
    {
        return Task::query()->findOrFail($id);
    }

    /**
     * Update an existing task with given data.
     *
     * @param Task  $task
     * @param array $data
     * @return Task
     */
    public function update(Task $task, array $data): Task
    {
        $task->fill($data);
        $task->save();

        return $task->refresh();
    }

    /**
     * Soft delete or delete the given task.
     *
     * @param Task $task
     * @return void
     */
    public function delete(Task $task): void
    {
        $task->delete();
    }

    /**
     * Return aggregated statistics for tasks grouped by status and priority.
     *
     * @return array{totalTasks:int,byStatus:array<string,int>,byPriority:array<string,int>}
     */
    public function getStatistics(): array
    {
        $byStatus = Task::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $byPriority = Task::query()
            ->selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        return [
            'totalTasks' => Task::query()->count(),
            'byStatus' => $byStatus,
            'byPriority' => $byPriority,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function search(array $filters = [], ?string $sortBy = null, string $sortDir = 'desc', ?int $perPage = null): LengthAwarePaginator|Collection
    {
        $query = Task::query();

        // Filters
        if (!empty($filters['id'])) {
            $query->where('id', (int) $filters['id']);
        }
        if (!empty($filters['title'])) {
            $query->where('title', 'ilike', '%'.$filters['title'].'%');
        }
        if (!empty($filters['description'])) {
            $query->where('description', 'ilike', '%'.$filters['description'].'%');
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (!empty($filters['due_date_from'])) {
            $query->where('due_date', '>=', $filters['due_date_from']);
        }
        if (!empty($filters['due_date_to'])) {
            $query->where('due_date', '<=', $filters['due_date_to']);
        }
        if (!empty($filters['created_from'])) {
            $query->where('created_at', '>=', $filters['created_from']);
        }
        if (!empty($filters['created_to'])) {
            $query->where('created_at', '<=', $filters['created_to']);
        }
        if (!empty($filters['updated_from'])) {
            $query->where('updated_at', '>=', $filters['updated_from']);
        }
        if (!empty($filters['updated_to'])) {
            $query->where('updated_at', '<=', $filters['updated_to']);
        }

        // Sorting
        $sortBy = $sortBy ?: 'created_at';
        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';
        if (in_array($sortBy, ['id', 'title', 'created_at', 'updated_at', 'due_date'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Return
        if ($perPage !== null) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }
}
