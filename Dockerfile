# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client package definitions for layer caching
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY school/package.json ./school/

# Install dependencies across workspaces
RUN npm ci

# Copy client source code and build production assets
COPY client/ ./client/
RUN npm run build:client

# -------------------------------------------------------------
# Production runner image
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package files and install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application backend, sub-portals, and built frontend
COPY server/ ./server/
COPY database/ ./database/
COPY prayer/ ./prayer/
COPY school/ ./school/
COPY sec/ ./sec/
COPY news.jpeg news1.jpeg pensafallback.png sermon.png slid.png slide.png slide1.png wecare.png library_landing_page.html newspaper.html ./
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001

CMD ["node", "server/server.js"]
