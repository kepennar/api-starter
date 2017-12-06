# api-starter

A simple Node.js AP starter

# Start

Simple:

```
npm install
npm start
```

## Developing

With a file watcher (`nodemon`)

```
npm run start:dev
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

All api endpoint can be listed `/available-routes`

```json
[
  { "path": "/", "method": ["HEAD", "GET"] },
  { "path": "/stocks/", "method": ["HEAD", "GET"] },
  { "path": "/available-routes", "method": ["HEAD", "GET"] }
]
```

_// To be continued_
