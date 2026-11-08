# Multi-stage build for minimal & hardened container image
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for build
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code and build TypeScript
COPY src/ ./src/
RUN npm run build

# --- Production Runtime Image ---
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

# Run as non-root user (security best practice)
USER node

# MCP communicates over stdio
ENTRYPOINT ["node", "dist/index.js"]
