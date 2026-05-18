// src/middleware/rateLimit.ts (or src/repositories/rateLimit.ts)
import type { BunRequest } from "bun";
import { redis } from "../repositories/redis";

const LIMIT = 100; // max requests
const WINDOW_S = 60; // per 60 seconds

async function hitSlidingWindow(key: string): Promise<number> {
  const now = Date.now();
  const windowStart = now - WINDOW_S * 1000;
  const member = `${now}-${Math.random()}`;

  // 1) Remove everything older than windowStart. [min, max]. zremrangebyscore(key, min, max)
  await redis.zremrangebyscore(key, 0, windowStart);

  // 2) zadd(key, score, member) inserts a new entry with score now (this request’s timestamp)
  await redis.zadd(key, now, member);

  // 3) zcard(key) returns the number of members in the sorted set.
  const count = await redis.zcard(key);

  // 4) expire(key, seconds) sets a TTL so Redis eventually deletes the key if no more hits happen.
  await redis.expire(key, WINDOW_S);

  return count;
}

function getClientId(req: BunRequest): string {
  return (
    req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

export function withRateLimit(
  handler: (req: BunRequest) => Response | Promise<Response>,
) {
  return async (req: BunRequest): Promise<Response> => {
    const ip = getClientId(req);
    const key = `rl:${ip}`;

    const count = await hitSlidingWindow(key);
    const remaining = Math.max(0, LIMIT - count);

    if (count > LIMIT) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(WINDOW_S),
          "X-RateLimit-Limit": String(LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      });
    }

    const res = await handler(req);
    const headers = new Headers(res.headers);
    headers.set("X-RateLimit-Limit", String(LIMIT));
    headers.set("X-RateLimit-Remaining", String(remaining));

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  };
}
