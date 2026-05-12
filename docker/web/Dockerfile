# Build the Vue frontend in a separate stage so prod images don't depend
# on a host-built web/dist (Portainer just clones + composes).
FROM node:20 AS web-builder
WORKDIR /web
COPY web/package.json web/.npmrc ./
RUN npm install
COPY web/ ./
RUN npm run build

FROM node:20
WORKDIR /web

COPY package*.json ./
RUN npm install

COPY . .
COPY --from=web-builder /web/dist ./web/dist

CMD [ "node", "server.js" ]
