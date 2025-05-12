#!/bin/bash
set -e

# Install dependencies
echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

# Return to root directory
cd ..

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start the application
echo "Starting the application..."
node backend/server.js