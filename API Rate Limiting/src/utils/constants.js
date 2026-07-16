export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
export const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);
export const BLOCK_DURATION_MS = Number(process.env.BLOCK_DURATION_MS || 15 * 60_000);
export const REDIS_KEY_PREFIX = "api-rate-limiting";
