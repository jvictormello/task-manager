# Task Manager

Full‑stack task management system with a Laravel (PHP 8.2) API and a React + TypeScript frontend, fully containerized with Docker and Docker Compose. The project emphasizes typed contracts, clean components, server‑side pagination/sorting/filtering, and automated tests.

## Presentation Video
- Demo/Presentation (YouTube): https://youtu.be/1GMRUYxVPlE

## Requirements
- Docker 24+
- Docker Compose V2

## Services
- `db`: Postgres 16 (port 5432)
- `api`: PHP-FPM 8.3 (Laravel) behind Nginx
- `web`: Nginx serving Laravel at `http://localhost:8000`
- `frontend`: Vite dev server for React TS at `http://localhost:3000`

## Quick Start with Docker
```bash
# Clone repository
git clone git@github.com:jvictormello/task-manager.git
cd task-manager

# Prepare env files (optional)
# You can copy the templates now, or skip this step — the API container will
# seed backend/.env from backend/.env.example on first run. Frontend reads its
# env at runtime; copying is recommended but not required.
# cp backend/.env.example backend/.env
# cp frontend/.env.example frontend/.env

# Start entire stack
docker compose up -d --build

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Database: Postgres on localhost:5432 (see docker-compose.yml)
```

## Automatic Bootstrap
- Backend: if no Laravel project exists inside `backend/`, the `api` container runs `composer create-project`, generates the APP KEY, and executes migrations.
- Frontend: if `frontend/` has no `package.json`, the container scaffolds a Vite project (`react-ts` template) and installs dependencies.

## URLs
- Backend (Nginx): `http://localhost:8000`
- API (Laravel): `http://localhost:8000/api`
- Frontend (Vite): `http://localhost:3000`

## Database & Migrations
- Local (without Docker):
  - `cd backend && php artisan migrate`
- Docker:
  - `docker compose exec api php artisan migrate`

Automatic migrations at container startup: the API entrypoint (see `backend/docker/entrypoint.sh`) will:
- seed backend/.env from backend/.env.example if missing,
- generate `APP_KEY` when absent,
- clear caches so the new env is picked up,
- and then execute `php artisan migrate --force`.

This runs on `docker compose up` (not during image build) and only after Postgres passes healthcheck.

### Frontend UI
- React + TypeScript single-page app (Vite) with Dockerized dev server
- Task table with inline actions (edit, delete, mark completed) and status-aware badges
- Powerful filters (id/title/description/status/priority/date ranges) and column sorting (id/title/created/updated/due)
- Modal forms for create/edit with validation + error feedback; confirmation dialog for delete
- Dashboard statistics rendered from `/api/tasks/statistics`
- Reusable components (filters, modal, spinner, feedback banners) and accessible keyboard-friendly interactions

## API Documentation
The API returns JSON and uses standard HTTP status codes. All task listings are paginated by default with 10 items per page.

### Swagger (OpenAPI)
- UI: http://localhost:8000/api/documentation
- JSON: http://localhost:8000/docs (file lives at `backend/storage/api-docs/api-docs.json`).
- Auto-build: the `api` container builds the docs at startup.
- Manual refresh: `docker compose exec api php artisan l5-swagger:generate`
- Tip: whenever you change OpenAPI annotations, refresh the docs to see updates.

## API Endpoints
- `GET /api/tasks` – list tasks (always paginated; default `per_page=10`)
- `POST /api/tasks` – create a task
- `GET /api/tasks/{id}` – retrieve a specific task
- `PUT/PATCH /api/tasks/{id}` – update a task
- `DELETE /api/tasks/{id}` – delete a task
- `GET /api/tasks/statistics` – aggregated counts by status and priority

### Task Payload (create/update)
```json
{
  "title": "string (required, max 100)",
  "description": "string (required, max 500)",
  "status": "pending | in_progress | completed",
  "priority": "low | medium | high",
  "due_date": "ISO-8601 datetime (required)"
}
```

Responses include audit fields (`id`, `createdAt`, `updatedAt`) and `dueDate` in ISO-8601 format.

Validation errors return HTTP 422 with detailed messages. Missing resources return HTTP 404. All other errors include contextual messages and appropriate HTTP status codes.

### Query Parameters for `GET /api/tasks`
- Pagination: `per_page` (1–100, default 10), `page` (1‑based)
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
- `GET /api/tasks?sort_by=title&sort_dir=asc&per_page=20&page=1`
- `GET /api/tasks?status=pending&priority=high&title=bug`
- `GET /api/tasks?due_date_from=2025-10-01&due_date_to=2025-10-31`

### Response shape for paginated lists
```json
{
  "data": [ /* Task[] */ ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25,
    "from": 1,
    "to": 10
  }
}
```

## Architecture & Type Safety
- Backend: Laravel 12 (PHP 8.2) with strong typing, value objects (Enums) for `status` and `priority`, and typed service/repository interfaces.
- Frontend: React + TypeScript with typed API client, domain models, and component props.
- Database: Postgres with migrations and indexes (status/priority/dates). Soft deletes enabled on tasks.

## Development & Testing
Backend tests (PHPUnit):
```bash
cd backend
php artisan test
```

Tip: It’s advisable to run tests via Artisan from the backend directory (`cd backend && php artisan test`) so Laravel loads the testing environment as expected. If you encounter configuration cache issues, run `php artisan optimize:clear` or `php artisan config:clear` first.

Frontend dev server:
```bash
cd frontend
npm install
npm run dev
```

Dockerized testing (optional):
```bash
docker compose exec api php artisan config:clear
docker compose exec api php artisan test -- --do-not-cache-result
```

## Notes
- Postgres is preconfigured; credentials live in `docker-compose.yml` and `backend/.env`.
- Update Laravel CORS settings to match `FRONTEND_URL` in `backend/.env` if accessing from a different origin.
- A sample `.env.testing` is provided to run backend tests with SQLite in‑memory (outside containers).

## Submission Checklist (Mapping to Evaluation Criteria)
- API Development:
  - Clean, typed PHP (8.2) with Enums and contracts
  - All endpoints implemented and tested
  - Proper schema + soft deletes + indexes
  - Dockerized stack (db, api, web, frontend)
  - This README includes setup + API docs
- General:
  - Video presentation included: https://youtu.be/1GMRUYxVPlE
- React Development:
  - Typed components and props; reusable UI
  - Hooks for state/data fetching, typed responses
  - Responsive, accessible UI with clear feedback
  - API integration with error handling
  - Dockerfiles and Vite dev server
