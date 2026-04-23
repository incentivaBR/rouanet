FROM node:20-alpine
COPY backend/package.json backend/package-lock.json /build/
RUN cd /build && npm ci --prefix /
WORKDIR /srv
COPY backend/ .
COPY frontend/ /frontend/
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
