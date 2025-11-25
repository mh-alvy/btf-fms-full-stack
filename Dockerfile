# Full-Stack Deployment for Render.com
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy and install backend dependencies first
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --production

# Copy and install frontend dependencies
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

# Copy all source code
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build frontend as static export
WORKDIR /app/frontend
RUN npm run build

# Move static build to backend public folder  
WORKDIR /app
RUN mkdir -p ./backend/public && cp -r ./frontend/out/* ./backend/public/

# Set working directory to backend
WORKDIR /app/backend

# Expose port (Render will provide PORT environment variable)
EXPOSE $PORT

# Start only the backend server (which will serve static frontend)
CMD ["npm", "start"]