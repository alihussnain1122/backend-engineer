import {
  VIOLATION_THRESHOLD,
  VIOLATION_WINDOW_SECONDS,
  BLOCK_DURATION_SECONDS,
} from "../utils/constants.js";

function getBlockKey(clientId) {
  return `blocked:${clientId}`;
}

function isRedisLike(value) {
  return value && typeof value === "object" && typeof value.get === "function" && typeof value.set === "function";
}

function normalizeClientArgs(clientIdOrClient, maybeClientId, maybeClient) {
  if (isRedisLike(clientIdOrClient) && typeof maybeClientId === "string") {
    return {
      clientId: maybeClientId,
      client: clientIdOrClient,
    };
  }

  return {
    clientId: clientIdOrClient,
    client: maybeClient,
  };
}

let defaultRedisClientPromise;

async function getDefaultRedisClient() {
  if (!defaultRedisClientPromise) {
    defaultRedisClientPromise = import("../config/redis.js").then((module) => module.default);
  }

  return defaultRedisClientPromise;
}

export async function isBlocked(clientIdOrClient, maybeClientId, maybeClient) {
  const { clientId, client } = normalizeClientArgs(clientIdOrClient, maybeClientId, maybeClient);
  const redis = client || (await getDefaultRedisClient());
  const exists = await redis.exists(getBlockKey(clientId));
  return exists === 1;
}

export const isClientBlocked = isBlocked;

export async function blockClient(
  clientIdOrClient,
  maybeReason,
  maybeDurationMs,
  maybeClient,
  maybeClientId,
) {
  const { clientId, client } = normalizeClientArgs(clientIdOrClient, maybeClientId, maybeClient);
  const redis = client || (await getDefaultRedisClient());
  const reason = typeof maybeReason === "string" ? maybeReason : "manual";
  const durationMs = typeof maybeDurationMs === "number" ? maybeDurationMs : BLOCK_DURATION_SECONDS * 1000;
  const durationSeconds = Math.max(1, Math.ceil(durationMs / 1000));

  await redis.set(getBlockKey(clientId), reason, "EX", durationSeconds);
  console.warn(`🚫 Client blocked: ${clientId}`);
}

export async function unblockClient(clientIdOrClient, maybeClientId, maybeClient) {
  const { clientId, client } = normalizeClientArgs(clientIdOrClient, maybeClientId, maybeClient);
  const redis = client || (await getDefaultRedisClient());
  await redis.del(getBlockKey(clientId));
}

export async function getBlockReason(clientIdOrClient, maybeClientId, maybeClient) {
  const { clientId, client } = normalizeClientArgs(clientIdOrClient, maybeClientId, maybeClient);
  const redis = client || (await getDefaultRedisClient());
  return redis.get(getBlockKey(clientId));
}

export async function recordViolation(clientIdOrClient, maybeClientId, maybeClient) {
  const { clientId, client } = normalizeClientArgs(clientIdOrClient, maybeClientId, maybeClient);
  const redis = client || (await getDefaultRedisClient());
  const key = `violations:${clientId}`;
  const count = await redis.incr(key);

  // Pehli violation ho to expiry set karo (naya window shuru)
  if (count === 1) {
    await redis.expire(key, VIOLATION_WINDOW_SECONDS);
  }

  if (count >= VIOLATION_THRESHOLD) {
    await blockClient(clientId, "violation threshold reached", BLOCK_DURATION_SECONDS * 1000, redis);
  }

  return count;
}