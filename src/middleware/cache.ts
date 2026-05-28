import {
  clearOldEntries,
  cacheDel,
  cacheDelPattern,
  cacheGet,
  cacheSet,
} from '../repositories/cacheRepository';
import type { CacheOptions } from '../types/cacheType';

export async function getOrSet<T>({ key, ttlSec, loader }: CacheOptions<T>): Promise<T> {
  try {
    const cached = cacheGet(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.error(`[cache] GET failed for ${key}:`, error);
  }

  const fresh = await loader();

  try {
    cacheSet(key, ttlSec, JSON.stringify(fresh));
  } catch (error) {
    console.error(`[cache] SET failed for ${key}:`, error);
  }

  return fresh;
}

export async function delKeys(...keys: string[]) {
  if (keys.length) {
    cacheDel(...keys);
  }
}

export async function delAllBookmarkListCaches() {
  cacheDelPattern('bookmarks:list:*');
}

export const cacheKeys = {
  bookmarksById: (id: number) => `bookmarks:${id}`,
  bookmarksPage: (page: number, limit: number) => `bookmarks:list:${page}:${limit}`,
};

setInterval(() => {
  clearOldEntries();
}, 60_000);
