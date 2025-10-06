#!/usr/bin/env sh
set -e

cd /var/www/html

# If no Laravel app yet, bootstrap it (supports non-empty dir)
if [ ! -f artisan ]; then
  echo "No Laravel app detected. Creating a new Laravel project in a temp dir and copying over..."
  TMP_DIR="/tmp/laravel"
  rm -rf "$TMP_DIR" && mkdir -p "$TMP_DIR"
  composer create-project --prefer-dist laravel/laravel "$TMP_DIR" || true

  # Preserve existing envs if present
  [ -f .env ] && cp .env /tmp/.env.keep || true
  [ -f .env.example ] && cp .env.example /tmp/.env.example.keep || true

  # Copy generated project into current working dir
  cp -a "$TMP_DIR"/. .

  # Restore envs
  [ -f /tmp/.env.keep ] && mv -f /tmp/.env.keep .env || true
  [ -f /tmp/.env.example.keep ] && mv -f /tmp/.env.example.keep .env.example || true
fi

# Install dependencies if vendor missing
if [ ! -d vendor ] && [ -f composer.json ]; then
  composer install --no-interaction --prefer-dist || true
fi

if [ -f artisan ]; then
  if ! grep -q "^APP_KEY=" .env 2>/dev/null || [ -z "$(grep '^APP_KEY=' .env | cut -d= -f2-)" ]; then
    php artisan key:generate --force || true
  fi

  echo "Running migrations..."
  php artisan migrate --force || true

fi

exec "$@"
