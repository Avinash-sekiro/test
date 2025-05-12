#!/bin/bash

# AI Language Labs Deployment Script
# This script deploys the application to an Ubuntu server

# Exit on error
set -e

echo "Starting deployment process..."

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js and npm..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    sudo npm install -g pm2
fi

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get install -y nginx
fi

# Create application directory if it doesn't exist
APP_DIR="/var/www/ai-language-labs"
if [ ! -d "$APP_DIR" ]; then
    echo "Creating application directory..."
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
fi

# Copy application files to the server directory
echo "Copying application files..."
cp -r ./backend $APP_DIR/
cp -r ./frontend $APP_DIR/

# Install backend dependencies
echo "Installing backend dependencies..."
cd $APP_DIR/backend
npm install --production

# Create .env file from .env.example if not exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit the .env file with your actual credentials"
    echo "Run: sudo nano $APP_DIR/backend/.env"
fi

# Configure PM2 to start the application
echo "Configuring PM2..."
pm2 start server.js --name "ai-language-labs" --env production
pm2 save
pm2 startup

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ai-language-labs > /dev/null << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the Nginx site
sudo ln -sf /etc/nginx/sites-available/ai-language-labs /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment completed successfully!"
echo "Next steps:"
echo "1. Edit the .env file with your actual credentials: sudo nano $APP_DIR/backend/.env"
echo "2. Update the Nginx configuration with your actual domain: sudo nano /etc/nginx/sites-available/ai-language-labs"
echo "3. Set up SSL with Certbot: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo "4. Restart the application: pm2 restart ai-language-labs"
