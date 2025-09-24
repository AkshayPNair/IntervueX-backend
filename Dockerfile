# ---------- Build stage ----------
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Install deps
    COPY package*.json tsconfig.json ./
    RUN npm ci
    
    # Copy source and build
    COPY src ./src
    RUN npm run build
    
    # ---------- Runtime stage ----------
    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    
    # Install only production deps
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    # Copy built files
    COPY --from=builder /app/dist ./dist
    
    # Run as non-root user for security
    RUN addgroup -S app && adduser -S app -G app
    USER app
    
    EXPOSE 5000
    CMD ["node", "dist/server.js"]
    