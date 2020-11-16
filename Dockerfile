FROM node:lts-alpine as builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn 

COPY tsconfig.json  ./
COPY src ./src
COPY prisma ./prisma
RUN yarn build && yarn copy:conf

FROM node:lts-alpine as server

# Install curl: mandatory for healthcheck
RUN apk --no-cache add curl

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist .
COPY --from=builder /usr/src/app/prisma .

RUN yarn install --production
RUN yarn prisma:generate

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["npm", "start"]
