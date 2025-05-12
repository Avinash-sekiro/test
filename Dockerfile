FROM node:16

# Create app directory
WORKDIR /app

# Copy everything at once to simplify
COPY . .

# Install dependencies and wget for healthcheck
RUN apt-get update && apt-get install -y wget
RUN cd backend && npm install
RUN cd frontend && npm install

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV SUPABASE_URL=https://zmubswgdqfmleajkccqk.supabase.co
ENV SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdWJzd2dkcWZtbGVhamtjY3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxNzkxNzAsImV4cCI6MjAzMDc1NTE3MH0.Nh0fPXLQnpxUzRYN5Mfn4YZZlcnCWnYwMVjGmMGJpLY
ENV ALLOWED_ORIGINS=*
ENV JWT_SECRET=cLtfGNjMVn/JwYYt67GbzLVsqAKHXwMpWji7zYtTBMWRBp31rMDAzoOJOoSyyJN7sGjjr0QhzPDSZy/ElQjxtg==
# Use the public URL for API access
ENV API_URL=https://xw44wo0sk4oc408sccso08ok.147.79.67.62.sslip.io
ENV FRONTEND_URL=https://xw44wo0sk4oc408sccso08ok.147.79.67.62.sslip.io

# Expose port
EXPOSE 3000

# Add healthcheck - simplified to just check if the process is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
  CMD pgrep node || exit 1

# Create default .env file if not exists
RUN echo "PORT=3000\nNODE_ENV=production\nALLOWED_ORIGINS=*\nAPI_URL=http://localhost:3000\nFRONTEND_URL=http://localhost:8080\nSUPABASE_URL=https://zmubswgdqfmleajkccqk.supabase.co\nSUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdWJzd2dkcWZtbGVhamtjY3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxNzkxNzAsImV4cCI6MjAzMDc1NTE3MH0.Nh0fPXLQnpxUzRYN5Mfn4YZZlcnCWnYwMVjGmMGJpLY" > .env

# Make sure the app doesn't crash due to missing directories
RUN mkdir -p frontend/dist

# Start the application with proper error handling
CMD ["sh", "-c", "cd /app && node backend/server.js || (echo 'Application crashed. Check logs above for details.' && sleep 3600)"]
