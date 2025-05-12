# AI Language Labs - Deployment Guide

This document provides a comprehensive guide for deploying the AI Language Labs web application on an Ubuntu server. It includes all the required Node.js modules, server setup instructions, and deployment steps.

## Application Overview

AI Language Labs is a web application that provides speech-to-text, text-to-speech, and translation capabilities using the Sarvam.ai API. The application consists of a Node.js backend and a static HTML/CSS/JavaScript frontend.

## Required Node.js Modules

The following Node.js modules are required for the application to run:

| Module | Version | Purpose |
|--------|---------|---------|
| @supabase/supabase-js | ^2.21.0 | Supabase client for database operations |
| cors | ^2.8.5 | Cross-Origin Resource Sharing middleware |
| dotenv | ^16.0.3 | Environment variable management |
| express | ^4.18.2 | Web server framework |
| form-data | ^4.0.2 | Handling multipart form data for file uploads |
| jsonwebtoken | ^9.0.0 | JWT authentication |
| multer | ^1.4.5-lts.1 | Handling file uploads |
| node-fetch | ^2.7.0 | Making HTTP requests to external APIs |

## Server Setup Guide

### 1. Update and Install System Packages

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install required system dependencies
sudo apt install -y curl git build-essential
```

### 2. Install Node.js and npm

```bash
# Install Node.js 18.x (LTS version)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

### 3. Install PM2 (Process Manager)

PM2 is a production process manager for Node.js applications that helps keep your application running.

```bash
# Install PM2 globally
sudo npm install -g pm2
```

### 4. Set Up Firewall

```bash
# Allow SSH connections
sudo ufw allow ssh

# Allow HTTP and HTTPS traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Node.js application port (if accessing directly)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

### 5. Install and Configure Nginx as a Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx and enable it to start on boot
sudo systemctl start nginx
sudo systemctl enable nginx
```

Create an Nginx configuration file for your application:

```bash
sudo nano /etc/nginx/sites-available/ai-language-labs
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase max body size for file uploads
    client_max_body_size 10M;
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/ai-language-labs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Set Up SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Application Deployment

### 1. Clone the Repository

```bash
# Create a directory for the application
mkdir -p /var/www/ai-language-labs
cd /var/www/ai-language-labs

# Clone the repository
git clone https://your-repository-url.git .
```

### 2. Install Dependencies

```bash
# Navigate to the backend directory
cd backend

# Install production dependencies
npm install --production
```

### 3. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
nano .env
```

Add the following environment variables:

```
NODE_ENV=production
PORT=3000
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
SARVAM_API_KEY=your-sarvam-api-key
```

### 4. Start the Application with PM2

```bash
# Start the application
pm2 start server.js --name "ai-language-labs"

# Save the PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

Follow the instructions provided by the `pm2 startup` command to complete the setup.

### 5. Monitor the Application

```bash
# View application logs
pm2 logs ai-language-labs

# Monitor application status
pm2 monit
```

## Updating the Application

To update the application when new changes are available:

```bash
# Navigate to the application directory
cd /var/www/ai-language-labs

# Pull the latest changes
git pull

# Install any new dependencies
cd backend
npm install --production

# Restart the application
pm2 restart ai-language-labs
```

## Troubleshooting

### Common Issues and Solutions

1. **Application not starting:**
   - Check the logs: `pm2 logs ai-language-labs`
   - Verify environment variables are set correctly
   - Ensure all dependencies are installed

2. **Cannot connect to the application:**
   - Check if the application is running: `pm2 status`
   - Verify Nginx configuration
   - Check firewall settings: `sudo ufw status`

3. **File upload issues:**
   - Check Nginx client_max_body_size setting
   - Verify multer configuration in the backend

4. **API connection issues:**
   - Verify Sarvam API key is correct
   - Check network connectivity to external APIs

## Backup Strategy

### Database Backup

If using Supabase, regular backups are handled by the service. However, you can also set up additional backups:

```bash
# Create a backup script
nano /var/www/ai-language-labs/backup.sh
```

Add the following content:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/var/backups/ai-language-labs"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup environment variables
cp /var/www/ai-language-labs/backend/.env $BACKUP_DIR/.env.$DATE
```

Make the script executable and set up a cron job:

```bash
chmod +x /var/www/ai-language-labs/backup.sh
crontab -e
```

Add the following line to run the backup daily at 2 AM:

```
0 2 * * * /var/www/ai-language-labs/backup.sh
```

## Security Considerations

1. **Keep software updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Regularly update Node.js dependencies:**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Secure environment variables:**
   - Restrict access to the `.env` file:
   ```bash
   chmod 600 /var/www/ai-language-labs/backend/.env
   ```

4. **Set up fail2ban to prevent brute force attacks:**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

## Conclusion

This deployment guide provides all the necessary steps to deploy the AI Language Labs web application on an Ubuntu server. If you encounter any issues during deployment, refer to the troubleshooting section or consult the application documentation.

For additional support, please contact the development team.
