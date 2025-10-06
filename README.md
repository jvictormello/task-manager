# Task Manager

Projeto base com API em PHP (Laravel) e frontend em React + TypeScript usando Docker e docker-compose.

## Requisitos
- Docker 24+
- Docker Compose V2

## Serviços
- `db`: Postgres 16 (porta 5432)
- `api`: PHP-FPM 8.3 (Laravel) exposto via Nginx
- `web`: Nginx servindo Laravel em `http://localhost:8000`
- `frontend`: Vite dev server React TS em `http://localhost:3000`

## Primeira execução
1. Copie os envs (opcional, já há alguns defaults):
   - Backend: `backend/.env` (existe um `backend/.env.example`)
   - Frontend: copie `frontend/.env.example` para `frontend/.env` e ajuste `VITE_API_URL` se necessário
2. Suba os containers:
   - `docker compose up --build`

## Bootstrap automático
- Backend: se não existir um projeto Laravel em `backend/`, o container `api` irá rodar `composer create-project` e gerar a APP KEY, depois executar migrações.
- Frontend: se não existir `package.json` em `frontend/`, o container irá criar um projeto Vite (template `react-ts`) e instalar dependências.

## URLs
- Backend (Nginx): `http://localhost:8000`
- API (Laravel): `http://localhost:8000/api`
- Frontend (Vite): `http://localhost:3000`

## Notas
- O banco já está configurado para Postgres; credenciais em `docker-compose.yml` e `backend/.env`.
- Ajuste CORS no Laravel conforme `FRONTEND_URL` no `backend/.env` se necessário.
