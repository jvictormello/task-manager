<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Task Manager API',
    description: 'OpenAPI documentation for the Task Manager backend.'
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Local Nginx -> Laravel'
)]
#[OA\Tag(
    name: 'Tasks',
    description: 'CRUD operations and statistics for tasks.'
)]
class OpenApi
{
}

