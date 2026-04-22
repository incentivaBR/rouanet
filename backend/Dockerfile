FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install && \
    echo "=== CONTEUDO /app ===" && ls -la /app/ && \
    echo "=== TOTAL node_modules ===" && ls node_modules | wc -l && \
    echo "=== PROCURA HELMET ===" && find / -name "helmet" -type d 2>/dev/null | head -10
COPY backend/ .
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["node", "server.js"]
