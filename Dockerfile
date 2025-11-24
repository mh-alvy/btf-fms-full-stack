# Full-stack deployment for Render.com
FROM node:18-alpine AS frontend-builder

# Build Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine AS backend-builder

# Build Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

FROM node:18-alpine AS production

# Install serve globally for frontend
RUN npm install -g serve pm2

# Copy backend
WORKDIR /app
COPY --from=backend-builder /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Create startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo 'cd /app/backend && node server.js &' >> start.sh && \
    echo 'cd /app/frontend && npm start &' >> start.sh && \
    echo 'wait' >> start.sh && \
    chmod +x start.sh

# Expose both ports
EXPOSE 3000 3001

# Start both services
CMD ["./start.sh"]