FROM node:20-alpine AS deps
WORKDIR /build
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM node:20-alpine
COPY --from=deps /build/node_modules /node_modules
WORKDIR /srv
COPY backend/ .
COPY frontend/ /frontend/
# Busca assets do GitHub (excluídos do upload via .railwayignore para reduzir tamanho)
RUN apk add --no-cache git && \
    git clone --filter=blob:none --no-checkout --depth=1 \
    https://github.com/incentivaBR/rouanet.git /tmp/r && \
    git -C /tmp/r sparse-checkout set frontend/assets && \
    git -C /tmp/r checkout && \
    mv /tmp/r/frontend/assets /frontend/assets && \
    rm -rf /tmp/r && apk del git
ENV PORT=8080
CMD ["node", "server.js"]
