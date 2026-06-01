FROM php:8.2-apache

# Install required native packages
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    gnupg

# Add Official NodeSource for newer Node.js version
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install PHP extensions (Postgres, GD, Zip, BCMath, Intl)
RUN apt-get install -y libicu-dev && \
    docker-php-ext-configure intl && \
    docker-php-ext-install pdo pdo_pgsql pgsql gd zip bcmath intl

# Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy the entire project
COPY . .

# Install PHP Dependencies (No dev packages, optimized autoloader)
RUN composer install --no-interaction --no-dev --optimize-autoloader

# Install Node dependencies and compile the Vite/React frontend
RUN npm install
RUN npm run build
RUN rm -rf node_modules

# Change the Apache document root to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Enable .htaccess overrides for Laravel routing
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Set default port for Render
ENV PORT=80

# Change Apache's port configuration to listen on the dynamic $PORT provided by Render
RUN sed -i 's/Listen 80/Listen ${PORT}/g' /etc/apache2/ports.conf
RUN sed -i 's/:80/:${PORT}/g' /etc/apache2/sites-available/000-default.conf
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Give the web server permissions over directories Laravel needs to write to
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Create a bash script to run startup logic (migrations, caches)
RUN echo '#!/bin/bash\n\
php artisan config:cache\n\
php artisan route:cache\n\
php artisan view:cache\n\
if [ "$RUN_MIGRATIONS" = "true" ]; then php artisan migrate:fresh --force; fi\n\
php artisan storage:link\n\
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache\n\
apache2-foreground' > /usr/local/bin/start-container \
    && chmod +x /usr/local/bin/start-container

# On startup, this script will run
CMD ["start-container"]
