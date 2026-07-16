import { checkSlidingWindowLimit } from "../services/slidingWindowRateLimitService.js";
import { RATE_LIMIT_MAX_REQUESTS } from "../utils/constants.js";

export async function rateLimiter(req, res, next) {
	const clientId = req.clientId;

	if (!clientId) {
		return res.status(500).json({ error: "Client identifier missing" });
	}

	const result = await checkSlidingWindowLimit(clientId);
	const remaining = Math.max(RATE_LIMIT_MAX_REQUESTS - result.currentCount, 0);
	const resetSeconds = Math.max(Math.ceil(result.resetMs / 1000), 0);

	res.setHeader("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
	res.setHeader("X-RateLimit-Remaining", String(remaining));
	res.setHeader("X-RateLimit-Reset", String(resetSeconds));

	if (!result.allowed) {
		res.setHeader("Retry-After", String(resetSeconds));
		return res.status(429).json({
			error: "Too many requests",
			clientId,
			limit: RATE_LIMIT_MAX_REQUESTS,
			windowMs: result.resetMs,
		});
	}

	return next();
}
