FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json files first for better caching
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install -g npm@latest
RUN npm run install-all

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "backend/server.js"]