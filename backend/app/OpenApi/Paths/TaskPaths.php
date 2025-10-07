<?php

declare(strict_types=1);

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

class TaskPaths
{
    #[OA\Get(
        path: '/api/tasks',
        tags: ['Tasks'],
        summary: 'List tasks',
        parameters: [
            new OA\Parameter(ref: '#/components/parameters/PerPageParam'),
            new OA\Parameter(ref: '#/components/parameters/PageParam'),
            new OA\Parameter(ref: '#/components/parameters/SortByParam'),
            new OA\Parameter(ref: '#/components/parameters/SortDirParam'),
            new OA\Parameter(ref: '#/components/parameters/StatusParam'),
            new OA\Parameter(ref: '#/components/parameters/PriorityParam'),
            new OA\Parameter(ref: '#/components/parameters/TitleParam'),
            new OA\Parameter(ref: '#/components/parameters/DescriptionParam'),
            new OA\Parameter(ref: '#/components/parameters/DueDateFromParam'),
            new OA\Parameter(ref: '#/components/parameters/DueDateToParam'),
            new OA\Parameter(ref: '#/components/parameters/CreatedFromParam'),
            new OA\Parameter(ref: '#/components/parameters/CreatedToParam'),
            new OA\Parameter(ref: '#/components/parameters/UpdatedFromParam'),
            new OA\Parameter(ref: '#/components/parameters/UpdatedToParam'),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Paginated tasks', content: new OA\JsonContent(ref: '#/components/schemas/TaskCollection')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    public function listTasks(): void {}

    #[OA\Post(
        path: '/api/tasks',
        tags: ['Tasks'],
        summary: 'Create a new task',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/TaskInput')),
        responses: [
            new OA\Response(response: 201, description: 'Created', content: new OA\JsonContent(ref: '#/components/schemas/Task')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    public function createTask(): void {}

    #[OA\Get(
        path: '/api/tasks/{task}',
        tags: ['Tasks'],
        summary: 'Retrieve a task',
        parameters: [new OA\Parameter(ref: '#/components/parameters/TaskIdPathParam')],
        responses: [
            new OA\Response(response: 200, description: 'OK', content: new OA\JsonContent(ref: '#/components/schemas/Task')),
            new OA\Response(response: 404, description: 'Not found', content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')),
        ]
    )]
    public function getTask(): void {}

    #[OA\Put(
        path: '/api/tasks/{task}',
        tags: ['Tasks'],
        summary: 'Replace a task',
        parameters: [new OA\Parameter(ref: '#/components/parameters/TaskIdPathParam')],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/TaskInput')),
        responses: [
            new OA\Response(response: 200, description: 'OK', content: new OA\JsonContent(ref: '#/components/schemas/Task')),
            new OA\Response(response: 404, description: 'Not found', content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    public function replaceTask(): void {}

    #[OA\Patch(
        path: '/api/tasks/{task}',
        tags: ['Tasks'],
        summary: 'Update a task',
        parameters: [new OA\Parameter(ref: '#/components/parameters/TaskIdPathParam')],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/TaskUpdateInput')),
        responses: [
            new OA\Response(response: 200, description: 'OK', content: new OA\JsonContent(ref: '#/components/schemas/Task')),
            new OA\Response(response: 404, description: 'Not found', content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')),
            new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    public function updateTask(): void {}

    #[OA\Delete(
        path: '/api/tasks/{task}',
        tags: ['Tasks'],
        summary: 'Delete a task',
        parameters: [new OA\Parameter(ref: '#/components/parameters/TaskIdPathParam')],
        responses: [
            new OA\Response(response: 204, description: 'No content'),
            new OA\Response(response: 404, description: 'Not found', content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')),
        ]
    )]
    public function deleteTask(): void {}

    #[OA\Get(
        path: '/api/tasks/statistics',
        tags: ['Tasks'],
        summary: 'Task statistics',
        responses: [new OA\Response(response: 200, description: 'OK', content: new OA\JsonContent(ref: '#/components/schemas/TaskStatistics'))]
    )]
    public function taskStatistics(): void {}
}

