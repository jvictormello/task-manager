<?php

namespace App\Http\Requests\Task;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Authorize this request (open for this demo API).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for updating a task.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:100', 'filled'],
            'description' => ['sometimes', 'string', 'max:500', 'filled'],
            'status' => ['sometimes', 'string', Rule::in(array_column(TaskStatus::cases(), 'value'))],
            'priority' => ['sometimes', 'string', Rule::in(array_column(TaskPriority::cases(), 'value'))],
            'due_date' => ['sometimes', 'date'],
        ];
    }
}
