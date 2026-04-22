FROM node:20-alpine AS deps
WORKDIR /deps
COPY backend/package.json ./
RUN npm install --no-package-lock

FROM node:20-alpine
WORKDIR /app
COPY --from=deps /deps/node_modules ./node_modules
COPY backend/ .
COPY frontend/ /frontend/
EXPOSE 8080
ENV PORT=8080
CMD ["/bin/sh", "-c", "node server.js 2>&1"]
