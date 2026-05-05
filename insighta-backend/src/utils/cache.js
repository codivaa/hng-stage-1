import { createClient } from "redis";

let client = null;
let isConnected = false;

export const getRedisClient = async () => {
  if (client && isConnected) return client;

  client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
  });

  client.on("error", (err) => {
    console.error("Redis error:", err.message);
    isConnected = false;
  });

  client.on("connect", () => {
    isConnected = true;
  });

  await client.connect();
  return client;
};

export const getCache = async (key) => {
  try {
    const redis = await getRedisClient();
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error("Cache get error:", err.message);
    return null; // fallback to DB on Redis failure
  }
};

export const setCache = async (key, value, ttlSeconds = 60) => {
  try {
    const redis = await getRedisClient();
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    console.error("Cache set error:", err.message);
    // Don't throw — cache failure should not break the request
  }
};

export const invalidateCache = async (pattern) => {
  try {
    const redis = await getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    console.error("Cache invalidate error:", err.message);
  }
};