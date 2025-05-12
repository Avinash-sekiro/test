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

# Start the application
CMD ["node", "backend/server.js"]