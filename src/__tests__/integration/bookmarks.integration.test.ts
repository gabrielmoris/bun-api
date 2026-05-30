import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { serve } from 'bun';
process.env.DATABASE_PATH = './dataTests/test-bookmarks.db';

const { routes } = await import('../../routes');
const { initBookmarksTable, pruneBookmarksTable } = await import('../../db/bookmarkModel');
const { pruneRateLimitsTable } = await import('../../db/rateLimitModel');
const { initRateLimitTable } = await import('../../db/rateLimitModel');
const { initCacheTable } = await import('../../db/cacheModel');
const { closeDB } = await import('../../db/sqlite');

let server: ReturnType<typeof serve>;

async function seed(count: number) {
  for (let i = 1; i <= count; i++) {
    await fetch(`http://localhost:${server.port}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `https://www.web${i}.com`, title: `web ${i}` }),
    });
  }
}

beforeAll(() => {
  initBookmarksTable();
  initRateLimitTable();
  initCacheTable();
  server = serve({ port: 3000, routes });
});

beforeEach(() => {
  pruneBookmarksTable();
  pruneRateLimitsTable();
});

afterAll(() => {
  pruneBookmarksTable();
  pruneRateLimitsTable();
  server.stop();
  closeDB();
});

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

  test('returns 409 with duplicated bookmark', async () => {
    const body = { url: 'https://example.com', title: 'Example' };

    const first = await fetch(`http://localhost:${server.port}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(first.status).toBe(201);

    const second = await fetch(`http://localhost:${server.port}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(second.status).toBe(409);
  });
});

describe('GET /bookmarks', () => {
  test('returns 200 asking for bookmarks and the proper ingormation', async () => {
    await seed(20);
    const res = await fetch(`http://localhost:${server.port}/bookmarks`);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data?.success).toBeTrue();
    expect(data?.page).toBe(1);
    expect(data?.limit).toBe(20);
    expect(data.data).toBeArray();
    expect(data.data).toHaveLength(20);
  });

  test('returns proper pagination', async () => {
    await seed(20);
    const res = await fetch(`http://localhost:${server.port}/bookmarks?page=2&limit=1`);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data?.success).toBeTrue();
    expect(data?.page).toBe(2);
    expect(data?.limit).toBe(1);
    expect(data.data).toBeArray();
    expect(data.data).toHaveLength(1);
    expect(data.total).toBe(20);
    expect(data.totalPages).toBe(20);
  });

  test('rate limit is working', async () => {
    let lastResponse: any;
    for (let i = 1; i <= 101; i++) {
      lastResponse = await fetch(`http://localhost:${server.port}/bookmarks`);
    }

    expect(lastResponse.ok).toBeFalse();
    expect(lastResponse.status).toBe(429);
    expect(lastResponse.statusText).toBe('Too Many Requests');
  });
});

describe('Modify bookmarks', async () => {
  test('Modifies a bookmark', async () => {
    await seed(20);
    const res = await fetch(`http://localhost:${server.port}/bookmarks/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://changed.com', title: 'changed' }),
    });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBeTrue();
    expect(data.data.url).toBe('https://changed.com');
    expect(data.data.title).toBe('changed');
  });

  test("Doesn't modify a bookmark that does't exist", async () => {
    const res = await fetch(`http://localhost:${server.port}/bookmarks/21`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://changed.com', title: 'changed' }),
    });
    expect(res.status).toBe(404);
    expect(res.statusText).toBe('Not Found');
    const data: any = await res.json();
    expect(data).toMatchObject({
      error: {
        code: 'NOT_FOUND',
        message: 'This bookmark could not be found',
        details: [
          {
            field: 'id',
            message: 'No bookmark with id 21',
          },
        ],
      },
    });
  });
});

describe('Delete bookmarks', async () => {
  test('deletes Bookmark', async () => {
    await seed(20);
    const res = await fetch(`http://localhost:${server.port}/bookmarks/1`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data: any = await res.json();

    expect(res.status).toBe(200);

    expect(data.data.id).toBe(1);
    expect(data.success).toBe(true);
  });

  test("Doesn't delete a bookmark that does't exist", async () => {
    const res = await fetch(`http://localhost:${server.port}/bookmarks/21`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data: any = await res.json();

    expect(res.status).toBe(404);

    expect(data).toMatchObject({
      error: {
        code: 'NOT_FOUND',
        message: 'This bookmark could not be found',
        details: [
          {
            field: 'id',
            message: 'No bookmark with id 21',
          },
        ],
      },
    });
  });
});
