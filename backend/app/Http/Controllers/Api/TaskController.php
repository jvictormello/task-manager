<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\IndexTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Contracts\Services\TaskServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class TaskController extends Controller
{
    /**
     * Inject the task service abstraction.
     */
    public function __construct(private readonly TaskServiceInterface $tasks) {}

    /**
     * List tasks. Supports optional pagination via `per_page` query param.
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(IndexTaskRequest $request)
    {
        $validated = $request->validated();
        $perPage = $validated['per_page'] ?? 10;
        $sortBy = $validated['sort_by'] ?? null;
        $sortDir = $validated['sort_dir'] ?? 'desc';
        $filters = array_intersect_key($validated, array_flip([
            'id','title','description','status','priority','due_date_from','due_date_to','created_from','created_to','updated_from','updated_to'
        ]));

        $result = $this->tasks->search($filters, $sortBy, $sortDir, $perPage);

        if ($result instanceof LengthAwarePaginator) {
            return TaskResource::collection($result);
        }

        if ($result instanceof Collection) {
            return TaskResource::collection($result);
        }

        return TaskResource::collection(collect($result));
    }

    /**
     * Create a new task.
     *
     * @param StoreTaskRequest $request
     * @return JsonResponse
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->tasks->create($request->validated());

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Retrieve a single task by id.
     *
     * @param int $task
     * @return TaskResource
     */
    public function show(int $task): TaskResource
    {
        return new TaskResource($this->tasks->find($task));
    }

    /**
     * Update an existing task by id.
     *
     * @param UpdateTaskRequest $request
     * @param int               $task
     * @return TaskResource
     */
    public function update(UpdateTaskRequest $request, int $task): TaskResource
    {
        $updated = $this->tasks->update($task, $request->validated());

        return new TaskResource($updated);
    }

    /**
     * Delete a task by id.
     *
     * @param int $task
     * @return JsonResponse
     */
    public function destroy(int $task): JsonResponse
    {
        $this->tasks->delete($task);

        return response()->json(null, 204);
    }

    /**
     * Return aggregated statistics grouped by status and priority.
     *
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        return response()->json($this->tasks->statistics());
    }
}
