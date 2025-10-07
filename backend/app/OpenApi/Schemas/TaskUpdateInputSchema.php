<?php

declare(strict_types=1);

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TaskUpdateInput',
    type: 'object',
    properties: [
        new OA\Property(property: 'title', type: 'string', maxLength: 100),
        new OA\Property(property: 'description', type: 'string', maxLength: 500),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'in_progress', 'completed']),
        new OA\Property(property: 'priority', type: 'string', enum: ['low', 'medium', 'high']),
        new OA\Property(property: 'due_date', type: 'string', format: 'date'),
    ]
)]
class TaskUpdateInputSchema
{
}

