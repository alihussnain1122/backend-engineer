import redisClient from "../config/redis.js";
import { BLOCK_DURATION_MS, REDIS_KEY_PREFIX } from "../utils/constants.js";

function getBlockKey(clientId) {
	return `${REDIS_KEY_PREFIX}:block:${clientId}`;
}

export async function blockClient(clientId, reason = "manual", durationMs = BLOCK_DURATION_MS) {
	await redisClient.set(getBlockKey(clientId), reason, "PX", durationMs);
}

export async function unblockClient(clientId) {
	await redisClient.del(getBlockKey(clientId));
}

export async function isClientBlocked(clientId) {
	const result = await redisClient.get(getBlockKey(clientId));
	return Boolean(result);
}

export async function getBlockReason(clientId) {
	return redisClient.get(getBlockKey(clientId));
}
