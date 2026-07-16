import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const useTls = typeof redisUrl === "string" && redisUrl.startsWith("rediss://");
const useTestRedis = process.env.NODE_ENV === "test" || process.argv.includes("--test");

if (!redisUrl && !useTestRedis) {
  console.warn("REDIS_URL is not set. Redis client will use the default localhost connection.");
}

function createInMemoryRedisClient() {
  const store = new Map();

  return {
    status: "ready",
    async exists(key) {
      return store.has(key) ? 1 : 0;
    },
    async set(key, value) {
      store.set(key, String(value));
      return "OK";
    },
    async del(key) {
      return store.delete(key) ? 1 : 0;
    },
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async incr(key) {
      const current = Number(store.get(key) || 0) + 1;
      store.set(key, String(current));
      return current;
    },
    async expire() {
      return 1;
    },
    async quit() {
      store.clear();
      return "OK";
    },
    disconnect() {
      store.clear();
    },
  };
}

const redisClient = useTestRedis
  ? createInMemoryRedisClient()
  : new Redis(redisUrl, {
      ...(useTls ? { tls: {} } : {}),
    });

if (!useTestRedis) {
  redisClient.on("connect", () => {
    console.log("Redis connected successfully");
  });

  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err.stack || err.message);
  });
}

export default redisClient;