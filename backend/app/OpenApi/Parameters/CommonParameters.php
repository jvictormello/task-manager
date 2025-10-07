<?php

declare(strict_types=1);

namespace App\OpenApi\Parameters;

use OpenApi\Attributes as OA;

#[OA\Parameter(
    parameter: 'PerPageParam', name: 'per_page', in: 'query', required: false,
    description: 'Items per page (1-100). Default: 10.',
    schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)
)]
#[OA\Parameter(
    parameter: 'PageParam', name: 'page', in: 'query', required: false,
    description: 'Page number (1-indexed).',
    schema: new OA\Schema(type: 'integer', minimum: 1)
)]
#[OA\Parameter(
    parameter: 'SortByParam', name: 'sort_by', in: 'query', required: false,
    description: 'Field to sort by.',
    schema: new OA\Schema(type: 'string', enum: ['id', 'title', 'created_at', 'updated_at', 'due_date'])
)]
#[OA\Parameter(
    parameter: 'SortDirParam', name: 'sort_dir', in: 'query', required: false,
    description: 'Sort direction.',
    schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])
)]
#[OA\Parameter(
    parameter: 'TitleParam', name: 'title', in: 'query', required: false,
    description: 'Filter by title (contains).',
    schema: new OA\Schema(type: 'string')
)]
#[OA\Parameter(
    parameter: 'DescriptionParam', name: 'description', in: 'query', required: false,
    description: 'Filter by description (contains).',
    schema: new OA\Schema(type: 'string')
)]
#[OA\Parameter(
    parameter: 'StatusParam', name: 'status', in: 'query', required: false,
    description: 'Filter by status.',
    schema: new OA\Schema(type: 'string', enum: ['pending', 'in_progress', 'completed'])
)]
#[OA\Parameter(
    parameter: 'PriorityParam', name: 'priority', in: 'query', required: false,
    description: 'Filter by priority.',
    schema: new OA\Schema(type: 'string', enum: ['low', 'medium', 'high'])
)]
#[OA\Parameter(
    parameter: 'DueDateFromParam', name: 'due_date_from', in: 'query', required: false,
    description: 'Due date >= (YYYY-MM-DD).',
    schema: new OA\Schema(type: 'string', format: 'date')
)]
#[OA\Parameter(
    parameter: 'DueDateToParam', name: 'due_date_to', in: 'query', required: false,
    description: 'Due date <= (YYYY-MM-DD).',
    schema: new OA\Schema(type: 'string', format: 'date')
)]
#[OA\Parameter(parameter: 'CreatedFromParam', name: 'created_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date'))]
#[OA\Parameter(parameter: 'CreatedToParam', name: 'created_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date'))]
#[OA\Parameter(parameter: 'UpdatedFromParam', name: 'updated_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date'))]
#[OA\Parameter(parameter: 'UpdatedToParam', name: 'updated_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date'))]
#[OA\Parameter(
    parameter: 'TaskIdPathParam', name: 'task', in: 'path', required: true,
    description: 'Task identifier',
    schema: new OA\Schema(type: 'integer', format: 'int64')
)]
class CommonParameters
{
}

