import { RedisClient } from "bun";

export const redis = new RedisClient(process.env.REDIS_URL!, {
  connectionTimeout: 1000,
  idleTimeout: 0,
  autoReconnect: true,
  maxRetries: 10,
  enableOfflineQueue: true,
  enableAutoPipelining: true,
});

redis.onconnect = () => {
  console.log("Redis connected");
};

redis.onclose = (error) => {
  console.error("Redis disconnected", error);
};
