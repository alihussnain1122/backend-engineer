import redisClient from "../config/redis.js";
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS, REDIS_KEY_PREFIX } from "../utils/constants.js";

function getWindowKey(clientId) {
	const windowStart = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS);
	return `${REDIS_KEY_PREFIX}:rate:${clientId}:${windowStart}`;
}

export async function rateLimiter(req, res, next) {
	const clientId = req.clientId;

	if (!clientId) {
		return res.status(500).json({ error: "Client identifier missing" });
	}

	const key = getWindowKey(clientId);
	const requests = await redisClient.incr(key);

	if (requests === 1) {
		await redisClient.expire(key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));
	}

	const remaining = Math.max(RATE_LIMIT_MAX_REQUESTS - requests, 0);
	const resetSeconds = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);

	res.setHeader("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
	res.setHeader("X-RateLimit-Remaining", String(remaining));
	res.setHeader("X-RateLimit-Reset", String(resetSeconds));

	if (requests > RATE_LIMIT_MAX_REQUESTS) {
		return res.status(429).json({
			error: "Too many requests",
			clientId,
			limit: RATE_LIMIT_MAX_REQUESTS,
			windowMs: RATE_LIMIT_WINDOW_MS,
		});
	}

	return next();
}
