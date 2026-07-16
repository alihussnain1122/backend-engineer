import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import redisClient from "../config/redis.js";
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS, REDIS_KEY_PREFIX } from "../utils/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const slidingWindowScriptPath = resolve(__dirname, "../../scripts/SlidingWindow.lua");
const slidingWindowScript = await readFile(slidingWindowScriptPath, "utf8");

export function createSlidingWindowKey(clientId) {
  return `${REDIS_KEY_PREFIX}:rate:${clientId}`;
}

export function createSlidingWindowMember() {
  return `${Date.now()}:${randomUUID()}`;
}

export async function checkSlidingWindowLimit(clientId) {
  const key = createSlidingWindowKey(clientId);
  const now = Date.now();
  const member = createSlidingWindowMember();

  const [allowedRaw, currentCountRaw, resetMsRaw] = await redisClient.eval(
    slidingWindowScript,
    1,
    key,
    now,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS,
    member,
  );

  return {
    allowed: Number(allowedRaw) === 1,
    currentCount: Number(currentCountRaw) || 0,
    resetMs: Number(resetMsRaw) || RATE_LIMIT_WINDOW_MS,
  };
}