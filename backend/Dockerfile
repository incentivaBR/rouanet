FROM node:20-alpine AS deps
WORKDIR /build
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM node:20-alpine
COPY --from=deps /build/node_modules /node_modules
WORKDIR /srv
COPY backend/ .
# frontend/assets entra direto na cópia: depois da centralização a pasta tem
# menos de 1 MB, e o build deixou de clonar o GitHub para buscá-la. Isso
# também tira do Dockerfile qualquer referência ao nome do repositório.
COPY frontend/ /frontend/
ENV PORT=8080
CMD ["node", "server.js"]
