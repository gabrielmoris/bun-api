import { mock } from "bun:test";
import { mockedBookmarks, mockedBookmark } from "./bookmarks.mock";
import type { IBookmark } from "../../types/bookmarkType";

// =====================
// Bookmark Repository
// =====================
export const findBookmarkByUrlMock = mock((url: string): IBookmark | null | undefined => {
  return mockedBookmarks.find((b) => b.url === url) ?? null;
});

export const createBookmarkInDbMock = mock(
  (data: IBookmark): IBookmark => ({
    ...data,
    id: 999,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
);

export const findBookmarkByIdMock = mock((id: string): IBookmark | null => {
  const numId = Number(id);
  return mockedBookmarks.find((b) => b.id === numId) ?? null;
});

export const findAndUpdateBookmarkMock = mock((id: string, update: Partial<IBookmark>): IBookmark | null => {
  const numId = Number(id);
  const foundBookmark = mockedBookmarks.find((b) => b.id === numId);
  if (!foundBookmark) return null;
  return { ...foundBookmark, ...update } as IBookmark;
});

export const deleteBookmarkMock = mock((id: string): { deletedCount: number } => {
  const numId = Number(id);
  const found = mockedBookmarks.find((b) => b.id === numId);
  return { deletedCount: found ? 1 : 0 };
});

export const findPaginatedBookmarksMock = mock((skip: number, limit: number): { total: number; bookmarks: IBookmark[] } => {
  return {
    total: mockedBookmarks.length,
    bookmarks: mockedBookmarks.slice(skip, skip + limit),
  };
});

export const mockBookmarkRepository = () =>
  mock.module("../../repositories/bookmarkRepository", () => ({
    findBookmarkByUrl: findBookmarkByUrlMock,
    createBookmarkInDb: createBookmarkInDbMock,
    findBookmarkById: findBookmarkByIdMock,
    findAndUpdateBookmark: findAndUpdateBookmarkMock,
    deleteBookmark: deleteBookmarkMock,
    findPaginatedBookmarks: findPaginatedBookmarksMock,
  }));

// =====================
// Cache
// =====================
export const delAllBookmarkListCachesMock = mock(async (): Promise<void> => {
  return;
});

export const delKeysMock = mock(async (keys: string[]): Promise<void> => {
  return;
});

export const mockCache = () =>
  mock.module("../../repositories/cache", () => ({
    delAllBookmarkListCaches: delAllBookmarkListCachesMock,
    delKeys: delKeysMock,
    cacheKeys: {
      bookmarkList: (page: number) => `bookmarks:list:${page}`,
      bookmarksById: (id: string) => `bookmarks:id:${id}`,
    },
    getOrSet: mock(async (_key: string, _ttlSec: number, _loader: () => Promise<any>) => {
      return null;
    }),
  }));

// =====================
// SQLite
// =====================
const createMockDB = () => ({
  prepare: mock((_query: string) => ({
    get: mock((..._args: any[]) => ({}) as any),
    all: mock((..._args: any[]) => [] as any[]),
    run: mock((..._args: any[]) => ({ changes: 0 })),
  })),
  run: mock((_query: string) => ({ changes: 0 })),
});

export const getDBMock = mock(() => createMockDB());

export const mockSqlite = () =>
  mock.module("../../db/sqlite", () => ({
    getDB: getDBMock,
  }));
