FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Install dependencies for both frontend and backend
FROM base AS deps
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm run install-all

# Copy source code
FROM deps AS builder
COPY . .

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend ./frontend
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY package.json ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
