export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
export const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);
export const BLOCK_DURATION_MS = Number(process.env.BLOCK_DURATION_MS || 15 * 60_000);
export const BLOCK_DURATION_SECONDS = Math.floor(BLOCK_DURATION_MS / 1000);
export const REDIS_KEY_PREFIX = "api-rate-limiting";

export const VIOLATION_THRESHOLD = Number(process.env.VIOLATION_THRESHOLD) || 5;
export const VIOLATION_WINDOW_SECONDS = Number(process.env.VIOLATION_WINDOW_SECONDS) || 300; // 5 min
