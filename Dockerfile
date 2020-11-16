FROM node:lts-alpine as builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn 

COPY tsconfig.json  ./
COPY src ./src
COPY prisma ./prisma
RUN yarn prisma:generate
RUN yarn build && yarn copy:conf


FROM node:lts-alpine as server

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist .
COPY --from=builder /usr/src/app/prisma .

RUN yarn install --production
RUN yarn prisma:generate

CMD ["npm", "start"]
