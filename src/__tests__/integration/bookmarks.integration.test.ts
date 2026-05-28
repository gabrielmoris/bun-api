import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { routes } from '../../routes';
import { serve } from 'bun';
// TODO: refactor after change of rate limiter to sqlite
let server: ReturnType<typeof serve>;

beforeAll(() => {
  server = serve({ port: 3000, routes });
});

afterAll(() => server.stop());

describe.skip('POST /bookmarks', () => {
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
