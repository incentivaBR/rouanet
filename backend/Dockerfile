FROM node:20-alpine
WORKDIR /srv
COPY backend/package.json ./
RUN npm install
COPY backend/ .
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["node", "server.js"]
