import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { findPaginatedBookmarksMock, mockBookmarkRepository } from '../mocks/db.mock';
import { mockedBookmarks } from '../mocks/bookmarks.mock';
import { cacheGetMock, mockCacheRepository } from '../mocks/cache.mock';

mockBookmarkRepository();
mockCacheRepository();

const { getPaginatedBookmarks } = await import('../../services/getPaginatedBookmarks');

describe('Bookmarks creation', () => {
  beforeEach(() => {
    mock.clearAllMocks();
  });

  test('It gets the all the bookmarks', async () => {
    const result = await getPaginatedBookmarks(1, 10);

    expect(findPaginatedBookmarksMock).toHaveBeenCalledWith(0, 10); // Skip is page-1

    expect(cacheGetMock).toHaveBeenCalled();

    expect(result).toMatchObject({
      total: 3,
      bookmarks: mockedBookmarks,
    });
  });

  test('It gets the first page with limit 1', async () => {
    const result = await getPaginatedBookmarks(1, 1);

    expect(findPaginatedBookmarksMock).toHaveBeenCalledWith(0, 1);
    expect(cacheGetMock).toHaveBeenCalled();

    expect(result).toMatchObject({
      total: 3,
      bookmarks: [mockedBookmarks[0]],
    });
  });

  test('It gets the second page with limit 1', async () => {
    const result = await getPaginatedBookmarks(2, 1);

    expect(findPaginatedBookmarksMock).toHaveBeenCalledWith(1, 1);
    expect(cacheGetMock).toHaveBeenCalled();

    expect(result).toMatchObject({
      total: 3,
      bookmarks: [mockedBookmarks[1]],
    });
  });

  test('Sends proper error structure when it fails', async () => {
    mockBookmarkRepository();

    expect(getPaginatedBookmarks(-1, 0)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Wrong required fields: page, limit',
      details: [
        {
          field: 'page',
          message: 'Page must be a positive integer',
        },
        {
          field: 'limit',
          message: 'Limit must be a positive integer',
        },
      ],
      statusCode: 400,
    });
  });
});
