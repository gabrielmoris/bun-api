import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';

process.env.DATABASE_PATH = '../../../dataTests/test-bookmarks.db';

const { withRateLimit, LIMIT } = await import('../../middleware/rateLimit');
const { getDB } = await import('../../db/sqlite');
const { initRateLimitTable } = await import('../../db/rateLimitModel');

function makeRequest(ip: string): Request {
  return new Request('http://localhost/test', {
    headers: { 'x-forwarded-for': ip },
  });
}

const okHandler = async () => new Response('OK', { status: 200 });

describe('withRateLimit', () => {
  beforeAll(() => {
    initRateLimitTable();
  });

  beforeEach(() => {
    const db = getDB();
    db.prepare('DELETE FROM rate_limit_hits WHERE client_id = ?').run('1.2.3.4');
  });

  test('passes request under the limit with rate limit headers', async () => {
    const handler = withRateLimit(okHandler);
    const res = await handler(makeRequest('1.2.3.4') as any);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe(LIMIT.toString());
    expect(res.headers.get('X-RateLimit-Remaining')).toBe((LIMIT - 1).toString());
  });

  test(`allows exactly ${LIMIT} requests (boundary)`, async () => {
    const db = getDB();
    const insert = db.prepare(`
    INSERT INTO rate_limit_hits (scope, client_id, created_at)
    VALUES (?, ?, ?)
  `);

    const now = Date.now();
    for (let i = 0; i < LIMIT - 1; i++) {
      insert.run('GET:/test', '1.2.3.4', now);
    }

    const handler = withRateLimit(okHandler);
    const res = await handler(makeRequest('1.2.3.4') as any);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe(LIMIT.toString());
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
  });
  test(`blocks the ${LIMIT + 1}st request with 429`, async () => {
    const db = getDB();

    const insert = db.prepare(`
      INSERT INTO rate_limit_hits (scope, client_id, created_at)
      VALUES (?, ?, ?)
    `);

    const now = Date.now();
    for (let i = 0; i < LIMIT; i++) {
      insert.run('GET:/test', '1.2.3.4', now);
    }

    const handler = withRateLimit(okHandler);
    const res = await handler(makeRequest('1.2.3.4') as any);

    expect(res.status).toBe(429);
    expect(await res.text()).toBe('Too Many Requests');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  test('preserves inner handler response headers', async () => {
    const handlerWithHeaders = async () =>
      new Response('OK', {
        status: 200,
        headers: { 'X-Custom-Header': 'my-value' },
      });

    const handler = withRateLimit(handlerWithHeaders);
    const res = await handler(makeRequest('1.2.3.4') as any);

    expect(res.headers.get('X-Custom-Header')).toBe('my-value');
  });
});
