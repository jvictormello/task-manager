<?php

declare(strict_types=1);

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TaskStatistics',
    type: 'object',
    required: ['totalTasks', 'byStatus', 'byPriority'],
    properties: [
        new OA\Property(property: 'totalTasks', type: 'integer', example: 25),
        new OA\Property(
            property: 'byStatus',
            type: 'object',
            properties: [
                new OA\Property(property: 'pending', type: 'integer', example: 10),
                new OA\Property(property: 'in_progress', type: 'integer', example: 8),
                new OA\Property(property: 'completed', type: 'integer', example: 7),
            ]
        ),
        new OA\Property(
            property: 'byPriority',
            type: 'object',
            properties: [
                new OA\Property(property: 'low', type: 'integer', example: 9),
                new OA\Property(property: 'medium', type: 'integer', example: 12),
                new OA\Property(property: 'high', type: 'integer', example: 4),
            ]
        ),
    ]
)]
class TaskStatisticsSchema
{
}

