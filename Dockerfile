# Full-Stack Deployment for Render.com
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files for both frontend and backend
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Install frontend dependencies
WORKDIR /app/frontend
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

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