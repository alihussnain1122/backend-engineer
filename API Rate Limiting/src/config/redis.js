import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const useTls = typeof redisUrl === "string" && redisUrl.startsWith("rediss://");

if (!redisUrl) {
  console.warn("REDIS_URL is not set. Redis client will use the default localhost connection.");
}

const redisClient = new Redis(redisUrl, {
  ...(useTls ? { tls: {} } : {}),
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err.stack || err.message);
});

export default redisClient;