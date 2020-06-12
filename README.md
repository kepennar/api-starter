# api-starter

A simple Node.js AP starter

<img src='./doc/koa.png?raw=true alt="KOA" width="300">
<img src='./doc/docker.svg?raw=true alt="docker" width="300">

# Start

Simple:

```bash
npm install
npm start
```

## Developing

With a file watcher (`nodemon`)

```bash
npm run start:dev
```

## Production

You can start it with the [Dockerfile](https://github.com/kepennar/api-starter/blob/master/Dockerfile)
provided

```bash
docker build -t api-starter .
docker run -p 80:3000 -d api-starter:latest
```

## Config

Easily customizable configuration.

With a `.env` file in the project root folder

```bash
#.env

PORT=3210
```

Or with environment variables

```bash
# Export a variable
export PORT=3210
npm start

# Directly in one command
PORT=3210 npm start
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
