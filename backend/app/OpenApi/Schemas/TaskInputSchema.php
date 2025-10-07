<?php

declare(strict_types=1);

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TaskInput',
    type: 'object',
    required: ['title', 'description', 'due_date'],
    properties: [
        new OA\Property(property: 'title', type: 'string', maxLength: 100, example: 'Plan sprint backlog'),
        new OA\Property(property: 'description', type: 'string', maxLength: 500, example: 'Refine the backlog ahead of sprint planning.'),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'in_progress', 'completed'], nullable: true),
        new OA\Property(property: 'priority', type: 'string', enum: ['low', 'medium', 'high'], nullable: true),
        new OA\Property(property: 'due_date', type: 'string', format: 'date', example: '2025-01-15'),
    ]
)]
class TaskInputSchema
{
}

