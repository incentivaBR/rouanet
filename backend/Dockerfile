FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install && ls node_modules/helmet && echo "=== HELMET OK POS-INSTALL ==="
COPY backend/ .
RUN ls node_modules/helmet && echo "=== HELMET OK POS-COPY ===" || echo "=== HELMET SUMIU NO COPY ==="
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["node", "server.js"]
