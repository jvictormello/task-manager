import type { TaskListResponse, TaskPayload, TaskStatistics, TaskFilters, Task } from '../types/task';
import { mapKeysToSnake } from '../utils/caseTransformers';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  queryParams?: Record<string, unknown>;
}

export interface ApiErrorData {
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public status: number;
  public data: ApiErrorData | null;

  constructor(status: number, message: string, data: ApiErrorData | null = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const buildQueryString = (params?: Record<string, unknown>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }
    searchParams.append(key, String(value));
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { queryParams, headers, ...rest } = options;
  const url = `${API_BASE_URL}/api${path}${buildQueryString(queryParams)}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    ...rest,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
};

export const taskApi = {
  async list(params: TaskFilters & { perPage?: number; sortBy?: string; sortDir?: string }) {
    const queryParams: Record<string, unknown> = mapKeysToSnake({ ...params });
    return request<TaskListResponse>('/tasks', { queryParams });
  },

  async statistics() {
    return request<TaskStatistics>('/tasks/statistics');
  },

  async create(payload: TaskPayload) {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(
        mapKeysToSnake({
          ...payload,
          dueDate: undefined,
          due_date: payload.dueDate,
        }),
      ),
    });
  },

  async update(id: number, payload: TaskPayload) {
    return request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(
        mapKeysToSnake({
          ...payload,
          dueDate: undefined,
          due_date: payload.dueDate,
        }),
      ),
    });
  },

  async delete(id: number) {
    await request<void>(`/tasks/${id}`, { method: 'DELETE' });
  },
};
