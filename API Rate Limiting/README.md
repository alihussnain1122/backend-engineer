# API Rate Limiting

Professional Express + Redis example for IP/API-key based rate limiting.

## Structure

- `src/server.js` starts the app after loading environment variables.
- `src/app.js` wires middleware, routers, and error handling.
- `src/routes/` contains public and admin routes.
- `src/middleware/` contains client identification, abuse detection, and rate limiting.
- `src/services/` wraps Redis-backed state and logging.
- `src/utils/` holds shared constants.
- `tests/` contains Node.js test files.

## Requirements

- Node.js 18+ recommended
- Redis or Upstash Redis

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create `.env` from `.env.example` and set `REDIS_URL`.

3. Start the app:

	```bash
	npm run dev
	```

4. Run tests:

	```bash
	npm test
	```

## Endpoints

- `GET /health`
- `GET /api/status`
- `GET /api/data`
- `GET /admin/block/:clientId`
- `POST /admin/block/:clientId`
- `DELETE /admin/block/:clientId`

## Notes

- If you use `rediss://`, TLS is enabled automatically.
- If `REDIS_URL` is missing, the app will try the local Redis default.
