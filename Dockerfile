FROM node:20-alpine AS deps
WORKDIR /build
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM node:20-alpine
COPY --from=deps /build/node_modules /node_modules
WORKDIR /srv
COPY backend/ .
COPY frontend/ /frontend/
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
