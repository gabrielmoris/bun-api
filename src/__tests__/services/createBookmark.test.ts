import { beforeEach, describe, expect, mock, test } from 'bun:test';
import {
  createBookmarkInDbMock,
  findBookmarkByUrlMock,
  mockBookmarkRepository,
} from '../mocks/db.mock';
import { mockedCreateBookmark } from '../mocks/bookmarks.mock';
import type { IBookmark } from '../../types/bookmarkType';
import { cacheDelPatternMock, mockCacheRepository } from '../mocks/cache.mock';

mockBookmarkRepository();
mockCacheRepository();

const { createBookmark } = await import('../../services/createBookmark');

describe('createBookmark', () => {
  beforeEach(() => {
    mock.clearAllMocks();
  });

  test('creates a bookmark and clears list caches on success', async () => {
    findBookmarkByUrlMock.mockReturnValueOnce(null);

    const result = await createBookmark(mockedCreateBookmark);

    expect(findBookmarkByUrlMock).toHaveBeenCalledWith(mockedCreateBookmark.url);
    expect(createBookmarkInDbMock).toHaveBeenCalledWith(mockedCreateBookmark);
    expect(cacheDelPatternMock).toHaveBeenCalledTimes(1);

    expect(result).toMatchObject({
      id: 999,
      url: mockedCreateBookmark.url,
      title: mockedCreateBookmark.title,
      description: mockedCreateBookmark.description,
      tags: mockedCreateBookmark.tags,
    });
  });

  test('throws DUPLICATED_ENTRY when the url already exists', async () => {
    findBookmarkByUrlMock.mockReturnValueOnce(mockedCreateBookmark as IBookmark);

    await expect(createBookmark(mockedCreateBookmark)).rejects.toMatchObject({
      code: 'DUPLICATED_ENTRY',
      message: 'This url is already in your database',
      details: [{ field: 'url', message: 'Duplicated url' }],
    });

    expect(createBookmarkInDbMock).not.toHaveBeenCalled();
    expect(cacheDelPatternMock).not.toHaveBeenCalled();
  });

  test('throws MISSING_ENTRY when required fields are omitted', async () => {
    const incomplete = { url: 'https://test.com' } as Partial<IBookmark>;

    await expect(createBookmark(incomplete)).rejects.toMatchObject({
      code: 'MISSING_ENTRY',
      message: 'Missing required field: title',
      details: [{ field: 'title', message: 'title is required' }],
    });

    expect(findBookmarkByUrlMock).not.toHaveBeenCalled();
    expect(createBookmarkInDbMock).not.toHaveBeenCalled();
    expect(cacheDelPatternMock).not.toHaveBeenCalled();
  });

  test('propagates error when the repository throws', async () => {
    findBookmarkByUrlMock.mockReturnValueOnce(null);
    createBookmarkInDbMock.mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });

    await expect(createBookmark(mockedCreateBookmark)).rejects.toThrow('Database connection lost');

    expect(cacheDelPatternMock).not.toHaveBeenCalled();
  });
});
