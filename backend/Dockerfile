FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install --no-package-lock
COPY backend/ .
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
CMD ["/bin/sh", "-c", "echo '=== START ===' && echo PORT=$PORT && echo NODE=$(node --version) && node server.js 2>&1"]
