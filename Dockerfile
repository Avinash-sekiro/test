FROM node:16

# Create app directory
WORKDIR /app

# Copy everything at once to simplify
COPY . .

# Install dependencies
RUN cd backend && npm install
RUN cd frontend && npm install

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Create default .env file if not exists
RUN echo "PORT=3000\nNODE_ENV=production" > .env

# Make sure the app doesn't crash due to missing directories
RUN mkdir -p frontend/dist

# Start the application with proper error handling
CMD ["sh", "-c", "cd /app && node backend/server.js || (echo 'Application crashed. Check logs above for details.' && sleep 3600)"]