FROM node:lts-alpine as builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn 

COPY tsconfig.json  ./
COPY src ./src
RUN yarn build && yarn copy:conf


FROM node:lts-alpine as server

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist .
RUN yarn install --production

CMD ["npm", "start"]
