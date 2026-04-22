FROM node:20-alpine AS deps
WORKDIR /deps
COPY backend/package.json ./
RUN npm install && echo "=== PACOTES INSTALADOS ===" && ls node_modules | wc -l

FROM node:20-alpine
WORKDIR /app
COPY --from=deps /deps/node_modules ./node_modules
COPY backend/ .
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["/bin/sh", "-c", "node server.js 2>&1"]
