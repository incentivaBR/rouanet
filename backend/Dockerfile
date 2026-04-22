FROM node:20-alpine
COPY backend/package.json /build/
RUN cd /build && npm install --prefix /
WORKDIR /srv
COPY backend/ .
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["node", "server.js"]
