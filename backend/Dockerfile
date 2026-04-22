FROM node:20-alpine
COPY backend/package.json /deps/
RUN cd /deps && npm install
COPY backend/ /app/
COPY frontend/ /frontend/
WORKDIR /app
ENV NODE_PATH=/deps/node_modules
ENV PORT=8080
CMD ["/bin/sh", "-c", "rm -rf /app/node_modules && ln -sf /deps/node_modules /app/node_modules && node server.js 2>&1"]
