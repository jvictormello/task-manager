#!/usr/bin/env bash
set -e

cd /app

if [ ! -f package.json ]; then
  echo "No Vite project detected. Bootstrapping React + TS via Vite (force overwrite if needed)..."
  # Non-interactive vite bootstrap; --force to allow non-empty dir (e.g., Dockerfile)
  npm create vite@latest . -- --template react-ts --force || true
fi

if [ -f package.json ] && [ ! -d node_modules ]; then
  npm install --no-audit --no-fund || true
fi

# Seed .env from example if missing so VITE_API_URL is defined
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "Seeding frontend .env from .env.example..."
  cp .env.example .env || true
fi

exec "$@"
