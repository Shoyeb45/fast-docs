# ============================================================
# Stage 1: Builder
# ============================================================
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

# Install qpdf and build dependencies
RUN apk add --no-cache qpdf python3 make g++

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev) for building
RUN npm ci

# Copy source and build
COPY tsconfig*.json ./
COPY src ./src

RUN npm run prisma:generate
RUN npm run build

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:22-alpine AS production

# Install qpdf and dumb-init in final image
RUN apk add --no-cache dumb-init

# Use non-root user for security
USER node
WORKDIR /home/node/app

# Copy package files
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate prisma client in production image
RUN npm run prisma:generate

# Copy compiled output from builder
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 8000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "-r", "dotenv/config", "dist/index.js"]