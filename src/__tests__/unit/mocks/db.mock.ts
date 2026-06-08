import { mock } from 'bun:test';
import { mockedBookmarks } from './bookmarks.mock';
import type { IBookmark, IDeletedBookmark } from '../../../types/bookmarkType';

// =====================
// Bookmark Repository Mocks
// =====================

export const findBookmarkByUrlMock = mock((url: string): IBookmark | null => {
  return mockedBookmarks.find(b => b.url === url) ?? null;
});

export const createBookmarkInDbMock = mock(
  (data: IBookmark): IBookmark => ({
    ...data,
    id: 999,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
);

export const findBookmarkByIdMock = mock((id: number): IBookmark | null => {
  return mockedBookmarks.find(b => b.id === id) ?? null;
});

export const findAndUpdateBookmarkMock = mock(
  (id: number, update: Partial<IBookmark>): IBookmark | null => {
    const foundBookmark = mockedBookmarks.find(b => b.id === id);

    if (!foundBookmark) return null;

    return {
      ...foundBookmark,
      ...update,
      updated_at: new Date().toISOString(),
    };
  }
);

export const deleteBookmarkMock = mock((id: number): IDeletedBookmark => {
  const found = mockedBookmarks.find(b => b.id === id);
  return { deletedCount: found ? 1 : 0, id };
});

export const findPaginatedBookmarksMock = mock(
  (skip: number, limit: number): { total: number; bookmarks: IBookmark[] } => {
    return {
      total: mockedBookmarks.length,
      bookmarks: mockedBookmarks.slice(skip, skip + limit),
    };
  }
);

export const mockBookmarkRepository = () =>
  mock.module('../../../repositories/bookmarkRepository', () => ({
    findBookmarkByUrl: findBookmarkByUrlMock,
    createBookmarkInDb: createBookmarkInDbMock,
    findBookmarkById: findBookmarkByIdMock,
    findAndUpdateBookmark: findAndUpdateBookmarkMock,
    deleteBookmark: deleteBookmarkMock,
    findPaginatedBookmarks: findPaginatedBookmarksMock,
  }));
