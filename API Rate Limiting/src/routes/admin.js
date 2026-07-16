import { Router } from "express";
import redisClient from "../config/redis.js";

const BLOCKED_KEY_PREFIX = "blocked:";

function getClientIdFromBlockedKey(key) {
  return key.startsWith(BLOCKED_KEY_PREFIX) ? key.slice(BLOCKED_KEY_PREFIX.length) : key;
}

async function listBlockedKeys(redis) {
  const blockedKeys = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${BLOCKED_KEY_PREFIX}*`, "COUNT", 100);
    blockedKeys.push(...keys);
    cursor = nextCursor;
  } while (cursor !== "0");

  return blockedKeys;
}

export function createAdminRouter(redis = redisClient) {
  const router = Router();

  router.get("/stats", async (req, res) => {
    try {
      const blockedKeys = await listBlockedKeys(redis);
      const blockedClientIds = blockedKeys.map(getClientIdFromBlockedKey).sort();

      return res.json({
        totalBlockedClients: blockedClientIds.length,
        blockedClientIds,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to load admin stats",
      });
    }
  });

  router.get("/blocked", async (req, res) => {
    try {
      const blockedKeys = await listBlockedKeys(redis);
      const blockedClients = await Promise.all(
        blockedKeys.map(async (key) => ({
          clientId: getClientIdFromBlockedKey(key),
          ttlSeconds: await redis.ttl(key),
        })),
      );

      blockedClients.sort((left, right) => left.clientId.localeCompare(right.clientId));

      return res.json({
        blockedClients,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to load blocked clients",
      });
    }
  });

  router.delete("/blocked/:clientId", async (req, res) => {
    try {
      const { clientId } = req.params;
      const deletedCount = await redis.del(`${BLOCKED_KEY_PREFIX}${clientId}`);

      return res.json({
        message: deletedCount > 0 ? "Client unblocked" : "Client not blocked",
        clientId,
        unblocked: deletedCount > 0,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to unblock client",
      });
    }
  });

  return router;
}

export default createAdminRouter();