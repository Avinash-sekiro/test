# Full Stack Application with Supabase Integration

This is a full stack application with Supabase integration for authentication, database, and file storage. The application implements role-based access control for three user roles: admin, schools, and demo.

## Project Structure

- **Frontend**: HTML, CSS, and JavaScript
  - `/css`: Stylesheets
  - `/js`: JavaScript files
  - `/pages`: HTML pages for different user roles

- **Backend**: Node.js with Express
  - `/routes`: API routes
  - `/config`: Configuration files
  - `/controllers`: Business logic

## Features

- Authentication with Supabase
- Role-based access control (admin, schools, demo)
- Database operations with Supabase
- File storage with Supabase

## Local Development Setup

### Prerequisites
- Node.js and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the backend directory
   - Add your Supabase URL and API key

4. Start the backend server:
   ```
   npm start
   ```

5. Open the frontend in a web browser:
   - Navigate to the `frontend` directory
   - Open `index.html` in your browser

## User Roles

- **Admin**: Full access to all features
- **Schools**: Access to school-specific features
- **Demo**: Limited access for demonstration purposes

## Production Deployment on Ubuntu Server

### Prerequisites
- Ubuntu Server (18.04 LTS or newer)
- Domain name pointing to your server
- SSH access to your server

### Automated Deployment

1. Connect to your Ubuntu server via SSH:
   ```
   ssh user@your_server_ip
   ```

2. Clone the repository:
   ```
   git clone https://github.com/yourusername/AI-Language-Labs.git
   cd AI-Language-Labs
   ```

3. Make the deployment script executable:
   ```
   chmod +x deploy.sh
   ```

4. Run the deployment script:
   ```
   ./deploy.sh
   ```

5. Follow the instructions provided by the script to:
   - Configure your environment variables
   - Update the Nginx configuration with your domain
   - Set up SSL with Certbot

### Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

1. **Update System Packages**
   ```
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js and npm**
   ```
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 (Process Manager)**
   ```
   sudo npm install -g pm2
   ```

4. **Install Nginx**
   ```
   sudo apt install nginx -y
   ```

5. **Set Up Application Directory**
   ```
   sudo mkdir -p /var/www/ai-language-labs
   sudo chown -R $USER:$USER /var/www/ai-language-labs
   ```

6. **Copy Application Files**
   ```
   cp -r ./backend /var/www/ai-language-labs/
   cp -r ./frontend /var/www/ai-language-labs/
   ```

7. **Install Backend Dependencies**
   ```
   cd /var/www/ai-language-labs/backend
   npm install --production
   ```

8. **Configure Environment Variables**
   ```
   cp .env.example .env
   nano .env
   ```
   Update the environment variables with your actual values.

9. **Start the Application with PM2**
   ```
   pm2 start server.js --name "ai-language-labs" --env production
   pm2 save
   pm2 startup
   ```

10. **Configure Nginx**
    ```
    sudo cp /var/www/ai-language-labs/nginx.conf /etc/nginx/sites-available/ai-language-labs
    ```
    Update the configuration with your domain name:
    ```
    sudo nano /etc/nginx/sites-available/ai-language-labs
    ```

11. **Enable the Nginx Site**
    ```
    sudo ln -sf /etc/nginx/sites-available/ai-language-labs /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

12. **Set Up SSL with Certbot**
    ```
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```

13. **Set Up Systemd Service (Optional)**
    ```
    sudo cp /var/www/ai-language-labs/ai-language-labs.service /etc/systemd/system/
    sudo systemctl enable ai-language-labs
    sudo systemctl start ai-language-labs
    ```

### Maintenance and Updates

1. **Update Application Code**
   ```
   cd /var/www/ai-language-labs
   git pull
   cd backend
   npm install --production
   pm2 restart ai-language-labs
   ```

2. **Monitor Application**
   ```
   pm2 logs ai-language-labs
   pm2 monit
   ```

3. **Backup Environment Variables**
   ```
   cp /var/www/ai-language-labs/backend/.env ~/ai-language-labs-env-backup
   ```

4. **Renew SSL Certificate (Automatic with Certbot)**
   Certbot creates a cron job that automatically renews certificates before they expire.

## Security Considerations

1. **Firewall Configuration**
   ```
   sudo ufw allow 'Nginx Full'
   sudo ufw allow OpenSSH
   sudo ufw enable
   ```

2. **Regular Updates**
   ```
   sudo apt update && sudo apt upgrade -y
   ```

3. **Secure Supabase Keys**
   - Use environment variables for all sensitive information
   - Implement Row Level Security in Supabase
   - Use the service role key only in the backend

4. **Rate Limiting**
   Add the following to your Nginx configuration:
   ```
   limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
   location /api/ {
       limit_req zone=api burst=10 nodelay;
       # other configuration...
   }
   ```
#   A I  
 #   A I  
 #   j u s t  
 #   i m  
 