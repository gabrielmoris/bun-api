import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { serve } from 'bun';
process.env.DATABASE_PATH = '../../../dataTests/test-bookmarks.db';

const { routes } = await import('../../routes');
const { initBookmarksTable } = await import('../../db/bookmarkModel');
const { initRateLimitTable } = await import('../../db/rateLimitModel');
const { initCacheTable } = await import('../../db/cacheModel');

let server: ReturnType<typeof serve>;

beforeAll(() => {
  initBookmarksTable();
  initRateLimitTable();
  initCacheTable();
  server = serve({ port: 3000, routes });
});

afterAll(() => server.stop());

describe('POST /bookmarks', () => {
  test('returns 201 with valid body', async () => {
    const res = await fetch(`http://localhost:${server.port}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com', title: 'Example' }),
    });
    expect(res.status).toBe(201);
  });

  test('returns 400 with missing fields', async () => {
    const res = await fetch(`http://localhost:${server.port}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }), // missing title
    });
    expect(res.status).toBe(400);
  });
});
