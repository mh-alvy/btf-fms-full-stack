# Backend-only deployment for Render.com
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy backend source code
COPY backend/ ./

# Create a simple health check script
RUN echo 'const http = require("http"); const options = { hostname: "localhost", port: process.env.PORT || 3001, path: "/api/health", method: "GET" }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on("error", () => process.exit(1)); req.end();' > health-check.js

# Expose port
EXPOSE $PORT

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node health-check.js

# Start the backend server
CMD ["npm", "start"]