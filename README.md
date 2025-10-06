# Task Manager

Starter kit featuring a PHP API (Laravel) and a React + TypeScript frontend, fully containerized with Docker and Docker Compose.

## Requirements
- Docker 24+
- Docker Compose V2

## Services
- `db`: Postgres 16 (port 5432)
- `api`: PHP-FPM 8.3 (Laravel) behind Nginx
- `web`: Nginx serving Laravel at `http://localhost:8000`
- `frontend`: Vite dev server for React TS at `http://localhost:3000`

## First Run
1. Prepare environment files (optional: defaults are already provided):
   - Backend: `backend/.env` (template in `backend/.env.example`)
   - Frontend: copy `frontend/.env.example` to `frontend/.env` and adjust `VITE_API_URL` if needed
2. Start the stack:
   - `docker compose up --build`

## Automatic Bootstrap
- Backend: if no Laravel project exists inside `backend/`, the `api` container runs `composer create-project`, generates the APP KEY, and executes migrations.
- Frontend: if `frontend/` has no `package.json`, the container scaffolds a Vite project (`react-ts` template) and installs dependencies.

## URLs
- Backend (Nginx): `http://localhost:8000`
- API (Laravel): `http://localhost:8000/api`
- Frontend (Vite): `http://localhost:3000`

## API Docs
Currently not enabled. If you want Swagger/OpenAPI docs later, we can add it back quickly.

## API Endpoints
- `GET /api/tasks` – list tasks (use `?per_page=` for pagination)
- `POST /api/tasks` – create a task
- `GET /api/tasks/{id}` – retrieve a specific task
- `PUT/PATCH /api/tasks/{id}` – update a task
- `DELETE /api/tasks/{id}` – delete a task
- `GET /api/tasks/statistics` – aggregated counts by status and priority

### Task Payload
```json
{
  "title": "string (required, max 100)",
  "description": "string (optional, max 500)",
  "status": "pending | in_progress | completed",
  "priority": "low | medium | high",
  "due_date": "ISO-8601 datetime (optional)"
}
```

Responses include audit fields (`id`, `createdAt`, `updatedAt`) and `dueDate` in ISO-8601 format.

Validation errors return HTTP 422 with detailed messages. Missing resources return HTTP 404. All other errors include contextual messages and appropriate HTTP status codes.

### Query Parameters for `GET /api/tasks`
- Pagination: `per_page` (1–100). Omit to return full list.
- Sorting: `sort_by` (`id`, `title`, `created_at`, `updated_at`, `due_date`) + `sort_dir` (`asc`|`desc`, default `desc`).
- Filters (all optional):
  - `id` (integer, exact)
  - `title` (substring, case-insensitive)
  - `description` (substring, case-insensitive)
  - `status` (`pending` | `in_progress` | `completed`)
  - `priority` (`low` | `medium` | `high`)
  - `due_date_from`, `due_date_to` (date range)
  - `created_from`, `created_to` (date range)
  - `updated_from`, `updated_to` (date range)

Examples:
- `GET /api/tasks?sort_by=title&sort_dir=asc&per_page=20`
- `GET /api/tasks?status=pending&priority=high&title=bug`
- `GET /api/tasks?due_date_from=2025-10-01&due_date_to=2025-10-31`

## Notes
- Postgres is preconfigured; credentials live in `docker-compose.yml` and `backend/.env`.
- Update Laravel CORS settings to match the `FRONTEND_URL` in `backend/.env` when needed.
