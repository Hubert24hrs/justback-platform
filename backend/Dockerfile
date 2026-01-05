# JustBack Backend - Cloud Run Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port (Cloud Run uses 8080)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the server
CMD ["node", "src/server.standalone-mock.js"]
