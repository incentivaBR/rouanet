FROM node:20-alpine AS deps
WORKDIR /deps
COPY backend/package.json ./
RUN npm install --no-package-lock && echo "=== HELMET NO DEPS ===" && ls node_modules | grep helmet

FROM node:20-alpine
WORKDIR /app
COPY --from=deps /deps/node_modules ./node_modules
RUN echo "=== HELMET APOS COPY FROM DEPS ===" && ls /app/node_modules | grep helmet
COPY backend/ .
RUN echo "=== HELMET APOS COPY BACKEND ===" && ls /app/node_modules | grep helmet || echo "SUMIU AQUI"
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["/bin/sh", "-c", "node server.js 2>&1"]
