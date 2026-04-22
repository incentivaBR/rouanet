FROM node:20-alpine
WORKDIR /app
COPY backend/ .
RUN rm -rf node_modules && npm install --no-package-lock
EXPOSE 8080
ENV PORT=8080
CMD ["/bin/sh", "-c", "node server.js 2>&1"]
