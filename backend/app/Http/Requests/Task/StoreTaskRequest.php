<?php

namespace App\Http\Requests\Task;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    /**
     * Authorize this request (open for this demo API).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for creating a task.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:100', 'filled'],
            'description' => ['required', 'string', 'max:500', 'filled'],
            'status' => ['nullable', 'string', Rule::in(array_column(TaskStatus::cases(), 'value'))],
            'priority' => ['nullable', 'string', Rule::in(array_column(TaskPriority::cases(), 'value'))],
            'due_date' => ['required', 'date'],
        ];
    }

    /**
     * Return validated data, applying default status/priority.
     *
     * @param string|array|null $key
     * @param mixed             $default
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);

        $data['status'] = $data['status'] ?? TaskStatus::PENDING->value;
        $data['priority'] = $data['priority'] ?? TaskPriority::MEDIUM->value;

        return $data;
    }
}
