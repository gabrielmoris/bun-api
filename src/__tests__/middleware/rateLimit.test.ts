import { describe, test, expect, mock, beforeEach } from "bun:test";

const redisMock = {
  zremrangebyscore: mock(async () => {}),
  zadd: mock(async () => {}),
  zcard: mock(async () => 1),
  expire: mock(async () => {}),
};

mock.module("../../repositories/redis", () => ({
  redis: redisMock,
}));

const { withRateLimit } = await import("../../middleware/rateLimit");

function makeRequest(ip: string): Request {
  return new Request("http://localhost/test", {
    headers: { "x-forwarded-for": ip },
  });
}

const okHandler = async () => new Response("OK", { status: 200 });

describe("withRateLimit", () => {
  beforeEach(() => {
    redisMock.zcard.mockImplementation(async () => 1);
  });

  test("passes request under the limit with rate limit headers", async () => {
    const handler = withRateLimit(okHandler);
    const res = await handler(makeRequest("1.2.3.4") as any);

    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("99");
  });

  test("allows exactly 100 requests (boundary)", async () => {
    redisMock.zcard.mockImplementation(async () => 100);
    const handler = withRateLimit(okHandler);
    const res = await handler(makeRequest("1.2.3.4") as any);

    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  test("blocks the 101st request with 429", async () => {
    redisMock.zcard.mockImplementation(async () => 101);
    const handler = withRateLimit(okHandler);
    const res = await handler(makeRequest("1.2.3.4") as any);

    expect(res.status).toBe(429);
    expect(await res.text()).toBe("Too Many Requests");
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  test("preserves inner handler response headers", async () => {
    const handlerWithHeaders = async () =>
      new Response("OK", {
        status: 200,
        headers: { "X-Custom-Header": "my-value" },
      });
    const handler = withRateLimit(handlerWithHeaders);
    const res = await handler(makeRequest("1.2.3.4") as any);

    expect(res.headers.get("X-Custom-Header")).toBe("my-value");
  });
});
