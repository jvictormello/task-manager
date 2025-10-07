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

# Ensure writable runtime directories exist (first-run safety)
mkdir -p storage/framework/cache \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache
chmod -R 775 storage bootstrap/cache || true
chown -R www-data:www-data storage bootstrap/cache || true

if [ -f artisan ]; then
  # Ensure an .env exists (bootstrap from example if missing)
  if [ ! -f .env ] && [ -f .env.example ]; then
    echo "No .env found. Seeding from .env.example..."
    cp .env.example .env || true
  fi

  # Generate app key if missing
  if ! grep -q "^APP_KEY=" .env 2>/dev/null || [ -z "$(grep '^APP_KEY=' .env | cut -d= -f2-)" ]; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force || true
  fi

  # Always clear caches so new env/APP_KEY is picked up
  php artisan optimize:clear || php artisan config:clear || true

  echo "Running migrations..."
  php artisan migrate --force || true

fi

exec "$@"
