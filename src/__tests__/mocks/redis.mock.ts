import { mock } from "bun:test";

export const delKeysMock = mock(async (..._keys: string[]) => {});
export const getOrSetMock = mock(
  async <T>({ loader }: { loader: () => Promise<T> }) => loader(),
);
export const delAllBookmarkListCachesMock = mock(async () => {});

export const mockCache = () =>
  mock.module("../../repositories/cache", () => ({
    delAllBookmarkListCaches: delAllBookmarkListCachesMock,
    delKeys: delKeysMock,
    getOrSet: getOrSetMock,
    cacheKeys: {
      bookmarksById: (id: string) => `bookmarks:${id}`,
      bookmarksPage: (page: number, limit: number) =>
        `bookmarks:list:${page}:${limit}`,
    },
  }));
