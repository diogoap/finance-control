FROM node:18

WORKDIR /web

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

CMD [ "node", "server.js" ]
