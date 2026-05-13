import { redis } from "./redis";

type CacheOptions<T> = {
  key: string;
  ttlSec: number;
  loader: () => Promise<T>;
};

export async function getOrSet<T>({
  key,
  ttlSec,
  loader,
}: CacheOptions<T>): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.error(`[cache] GET failed for ${key}:`, error);
  }

  const fresh = await loader();

  try {
    await redis.setex(key, ttlSec, JSON.stringify(fresh));
  } catch (error) {
    console.error(`[cache] SET failed for ${key}:`, error);
  }

  return fresh;
}

export async function delKeys(...keys: string[]) {
  if (keys.length) {
    await redis.del(...keys);
  }
}

export async function delAllBookmarkListCaches() {
  const keys = await redis.keys("bookmarks:list:*");
  if (keys.length) {
    await redis.del(...keys);
  }
}

export const cacheKeys = {
  bookmarksById: (id: string) => `bookmarks:${id}`,
  bookmarksPage: (page: number, limit: number) =>
    `bookmarks:list:${page}:${limit}`,
};
