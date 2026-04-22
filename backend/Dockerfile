FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci && test -d node_modules/helmet && echo "BUILD: HELMET OK"
COPY backend/ .
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["/bin/sh", "-c", "test -d /app/node_modules/helmet && echo 'RUNTIME: HELMET OK' || echo 'RUNTIME: HELMET SUMIU'; node server.js 2>&1"]
