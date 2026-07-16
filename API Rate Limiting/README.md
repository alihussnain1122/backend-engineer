# API Shield

API Shield is a production-oriented Express and Redis service for API-key/IP based abuse detection, sliding-window rate limiting, and manual block management.

## What It Does

- Identifies clients by API key or forwarded IP.
- Applies a Redis-backed sliding-window rate limit.
- Tracks repeated violations and blocks abusive clients.
- Exposes admin endpoints for inspecting and clearing blocked clients.
- Serves a lightweight admin dashboard at `/dashboard/`.

## Tech Stack

- Node.js
- Express 5
- Redis via ioredis
- ES modules
- Docker and Docker Compose

## Project Layout

- `src/server.js` loads environment variables and starts the HTTP server.
- `src/app.js` wires middleware, routes, dashboard serving, and error handling.
- `src/config/redis.js` creates the Redis client.
- `src/middleware/` contains client identification, abuse detection, and rate limiting.
- `src/routes/` contains public API routes and admin routes.
- `src/services/` contains Redis-backed blocklist and rate-limit helpers.
- `src/utils/` contains shared constants.
- `dashboard/index.html` contains the admin UI.
- `scripts/SlidingWindow.lua` contains the Redis Lua script for the sliding window.
- `tests/` contains Node.js test files.
- `docker-compose.yml` starts the app and Redis together.

## Requirements

- Node.js 18 or newer
- Redis 6+ or a compatible hosted Redis service
- Docker and Docker Compose if you want containerized runs

## Environment Variables

Create a `.env` file in the project root.

```bash
PORT=3000
REDIS_URL=redis://localhost:6379
```

### Variables

- `PORT`: HTTP server port. Defaults to `3000`.
- `REDIS_URL`: Redis connection string.
- `NODE_ENV`: Set to `production` for container/runtime deployments.

If `REDIS_URL` starts with `rediss://`, TLS is enabled automatically.
If `REDIS_URL` is missing, the app falls back to the local Redis default.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the application:

```bash
npm run dev
```

3. Open the API or dashboard:

```text
http://localhost:3000/health
http://localhost:3000/dashboard/
```

4. Run tests:

```bash
npm test
```

## Docker

Build and start the full stack:

```bash
docker compose up --build
```

This starts:

- `api-shield-app` on port `3000`
- `api-shield-redis` on port `6379`

The app container uses `REDIS_URL=redis://redis:6379` inside the Compose network.

## Dashboard

The dashboard is available at:

```text
http://localhost:3000/dashboard/
```

It shows:

- Total blocked clients
- Blocked client IDs
- Remaining TTL per blocked client
- Inline unblock actions

If you open `dashboard/index.html` from a static server, set the backend URL in the dashboard input field. The page also refreshes automatically every few seconds.

## API Endpoints

### Health

- `GET /health`

### Public API

- `GET /api/status`
- `GET /api/data`

### Admin API

- `GET /admin/stats`
- `GET /admin/blocked`
- `DELETE /admin/blocked/:clientId`

## Behavior Notes

- Clients are identified by `x-api-key` first, then `x-forwarded-for`, then IP.
- Blocked clients are stored as Redis keys in the form `blocked:${clientId}`.
- Rate-limit counters use Redis sorted sets under `ratelimit:${clientId}`.
- Violation counters use Redis string keys under `violations:${clientId}`.
- The admin list uses `SCAN` instead of `KEYS` so it stays safe in production.

## Testing

Run the full test suite with:

```bash
npm test
```

The suite uses Node's built-in test runner and exercises the blocklist, abuse detection, and client identification flows.

## Production Checklist

- Set `REDIS_URL` to your production Redis instance.
- Set `PORT` if your platform requires a different port.
- Run behind a reverse proxy if you need TLS termination or custom headers.
- Keep `NODE_ENV=production` in deployed environments.
- Use the Docker image or Compose setup for repeatable deployments.

## Troubleshooting

- If the dashboard shows connection errors, verify the backend URL in the dashboard input or open the dashboard from the Express server at `/dashboard/`.
- If Redis connection logs appear, confirm `REDIS_URL` points at a reachable Redis instance.
- If admin pages return empty results, make sure clients are actually blocked in Redis.

## License

MIT if you choose to add one later.
