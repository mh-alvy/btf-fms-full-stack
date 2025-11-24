# Multi-stage build for production deployment
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

FROM node:18-alpine AS production

WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# Install serve to serve frontend
RUN npm install -g serve

# Expose ports
EXPOSE 3000 3001

# Create startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo 'cd /app/backend && node server.js &' >> start.sh && \
    echo 'serve -s /app/frontend/out -l 3000' >> start.sh && \
    chmod +x start.sh

CMD ["./start.sh"]