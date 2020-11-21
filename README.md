# API-starter

**A Cloud Native Typescript Node.js API starter**

Build with:

- Deployment: [Docker](https://docs.docker.com/)
- DB: [PostgreSQL](https://www.postgresql.org/)
- Server: [Node.js](https://nodejs.org/)
- Language: [Typescript](https://www.typescriptlang.org/)
- Web framework: [Koa.js](https://koajs.com/)
- ORM: [Prisma](https://www.prisma.io/)
- Authentication: [Passport-jwt](http://www.passportjs.org/packages/passport-jwt/)
- Data validation: [Yup](https://github.com/jquense/yup)
- Logger: [Winston](https://github.com/winstonjs/winston)
- Configuration: [Convict](https://github.com/mozilla/node-convict)

## Development

### 1- Configure env

Configure a `.env` file following the `.env.example` file

```env
POSTGRES_USER=postgres        # postgresql user
POSTGRES_PASSWORD=admin       # postgresql password
POSTGRES_DB=api-starter       # postgresql database name

PORT=8080                     # Exposed API port
DB_URL=postgresql://postgres:admin@localhost:5432/api-starter?schema=public

AUTH_SECRET_KEY=<secret_to_sign_JWT_token>
AUTH_PASSWORD_SALT_ROUNDS=10  # Number of hashing rounds for password
AUTH_JWT_DURATION=3600        # Jwt token duration in seconds

```

### 2- Start the database with docker-compose

```bash
docker-compose -f docker-compose-dev.yml up
```

### 3- Install dependencies and generate the Prisma client

```bash
yarn
yarn prisma:generate
```

### 4- Create the database model

```bash
yarn prisma:db-upgrade
```

### 5- Start the API

Start the API with file watcher and debugging activated

```bash
yarn start:dev
```

## Production

### 1- Configure env

Configure a `.env` file following the `.env.example` file

`DB-URL` should look like `DB_URL=postgresql://postgres:admin@postgres:5432/api-starter?schema=public`

### 2- Start app

```bash
docker-compose up
```

# Healthcheck

The awesome API-starter provide an healthcheck mecanism By default
`http://localhost:3000/health`

```json
{
  "name": "api-starter",
  "version": "0.0.1",
  "checkers": [{ "name": "status", "value": "OK" }]
}
```

Healthcheck path can be configured

```javascript
app.use(health('/ping')
```

Custom checkers can easily be added

```javascript
app.use(health('/ping', [
  async (ctx, next) => {
    const status = await fetch(serviceUrl).then(res => res.json())
    ctx.body = {
      name: 'custom-check',
      status
    };
    next();
  }
])
```

# API routes

All api endpoint can be listed `/routes`

```json
[
  { "path": "/", "method": ["HEAD", "GET"] },
  { "path": "/stocks/", "method": ["HEAD", "GET"] },
  { "path": "/available-routes", "method": ["HEAD", "GET"] }
]
```

# Benchmarking

Benchmark use [wrk](https://github.com/wg/wrk) Benchmark generate random request
from a list defined
[here](https://github.com/kepennar/api-starter/blob/master/benchmark/script.lua#L2)

In benchmarks folder

```bash
# Default benchmark: Start a Docker instance execute request with 400 connections on 12 threads during various duration
make

```

_// To be continued_
