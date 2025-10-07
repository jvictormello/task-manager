<?php

declare(strict_types=1);

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Task',
    type: 'object',
    required: ['id', 'title', 'description', 'status', 'priority', 'createdAt', 'updatedAt'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', format: 'int64', example: 42),
        new OA\Property(property: 'title', type: 'string', maxLength: 100, example: 'Plan sprint backlog'),
        new OA\Property(property: 'description', type: 'string', maxLength: 500, example: 'Refine the backlog ahead of sprint planning.'),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'in_progress', 'completed'], example: 'pending'),
        new OA\Property(property: 'priority', type: 'string', enum: ['low', 'medium', 'high'], example: 'medium'),
        new OA\Property(property: 'dueDate', type: 'string', format: 'date-time', nullable: true, example: '2025-01-15T12:00:00+00:00'),
        new OA\Property(property: 'createdAt', type: 'string', format: 'date-time', example: '2025-01-01T08:30:00+00:00'),
        new OA\Property(property: 'updatedAt', type: 'string', format: 'date-time', example: '2025-01-05T10:45:00+00:00'),
    ]
)]
class TaskSchema
{
}

