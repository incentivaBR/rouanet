FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install --no-package-lock
COPY backend/ .
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
