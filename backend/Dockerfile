FROM node:20-alpine AS deps
WORKDIR /install
COPY backend/package.json .
RUN npm install

FROM node:20-alpine
WORKDIR /app
COPY backend/ .
COPY frontend/ /frontend/
COPY --from=deps /install/node_modules ./node_modules
ENV PORT=8080
CMD ["node", "server.js"]
