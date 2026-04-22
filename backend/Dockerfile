FROM node:20-alpine
WORKDIR /app
COPY backend/ .
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["/bin/sh", "-c", "npm install --prefer-offline 2>&1 && node server.js 2>&1"]
