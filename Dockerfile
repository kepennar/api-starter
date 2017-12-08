FROM node:8 as server

ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /usr/src/app
COPY package.json .

RUN npm install --production

COPY src src
CMD ["npm", "start"]
