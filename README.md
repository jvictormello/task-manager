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

## Notes
- Postgres is preconfigured; credentials live in `docker-compose.yml` and `backend/.env`.
- Update Laravel CORS settings to match the `FRONTEND_URL` in `backend/.env` when needed.
