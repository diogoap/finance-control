FROM node:20

WORKDIR /web

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source (must include pre-built web/dist; run `npm --prefix web run build` first)
COPY . .

CMD [ "node", "server.js" ]
