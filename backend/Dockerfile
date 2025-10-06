FROM php:8.3-fpm-alpine

WORKDIR /var/www/html

RUN apk add --no-cache git unzip postgresql-dev icu-dev oniguruma curl \
 && docker-php-ext-install intl opcache pcntl \
 && docker-php-ext-install pdo pdo_pgsql pgsql

RUN curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-custom.ini
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Ensure PHP-FPM listens on all interfaces for cross-container access
RUN set -eux; \
    sed -ri 's/^listen = .*/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm","-F"]
