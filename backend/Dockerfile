FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --no-package-lock
COPY . .
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
