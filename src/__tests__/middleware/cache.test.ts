import { describe, test, expect, beforeEach, mock, spyOn, afterEach } from 'bun:test';
import {
  mockCacheRepository,
  cacheDelMock,
  cacheDelPatternMock,
  cacheGetMock,
  cacheSetMock,
  clearOldEntriesMock,
} from '../mocks/cache.mock';
import { mockedBookmarks, mockedCreateBookmark } from '../mocks/bookmarks.mock';
let consoleErrorSpy: ReturnType<typeof spyOn>;

mockCacheRepository();

const { getOrSet, delKeys, delAllBookmarkListCaches, cacheKeys } =
  await import('../../middleware/cache');

describe('cache service', () => {
  beforeEach(() => {
    cacheGetMock.mockReset();
    cacheSetMock.mockReset();
    cacheDelMock.mockReset();
    cacheDelPatternMock.mockReset();
    clearOldEntriesMock.mockReset();
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('returns parsed cached value when cache hit', async () => {
    cacheGetMock.mockReturnValueOnce(JSON.stringify(mockedCreateBookmark));

    const loader = mock(async () => mockedBookmarks[2]);

    const result = await getOrSet({
      key: cacheKeys.bookmarksById(1),
      ttlSec: 60,
      loader,
    });

    expect(result).toMatchObject(mockedCreateBookmark);
    expect(loader).not.toHaveBeenCalled();
    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  test('calls loader and stores fresh value when cache miss', async () => {
    cacheGetMock.mockReturnValueOnce(null);

    const loader = mock(async () => mockedBookmarks[2]);

    const result = await getOrSet({
      key: cacheKeys.bookmarksById(2),
      ttlSec: 60,
      loader,
    });

    expect(result).toEqual(mockedBookmarks[2]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(cacheSetMock).toHaveBeenCalledTimes(1);
    expect(cacheSetMock).toHaveBeenCalledWith(
      cacheKeys.bookmarksById(2),
      60,
      JSON.stringify(mockedBookmarks[2])
    );
  });

  test('returns fresh value when cacheGet throws', async () => {
    cacheGetMock.mockImplementationOnce(() => {
      throw new Error('cache read failed');
    });

    const loader = mock(async () => mockedBookmarks[2]);

    const result = await getOrSet({
      key: cacheKeys.bookmarksById(3),
      ttlSec: 60,
      loader,
    });

    expect(result).toEqual(mockedBookmarks[2]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(cacheSetMock).toHaveBeenCalledTimes(1);
  });

  test('returns fresh value when cacheSet throws', async () => {
    cacheGetMock.mockReturnValueOnce(null);
    cacheSetMock.mockImplementationOnce(() => {
      throw new Error('cache write failed');
    });

    const loader = mock(async () => mockedBookmarks[0]);

    const result = await getOrSet({
      key: cacheKeys.bookmarksById(4),
      ttlSec: 60,
      loader,
    });

    expect(result).toEqual(mockedBookmarks[0]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(cacheSetMock).toHaveBeenCalledTimes(1);
  });

  test('delKeys calls cacheDel when keys exist', async () => {
    await delKeys('a', 'b');

    expect(cacheDelMock).toHaveBeenCalledTimes(1);
    expect(cacheDelMock).toHaveBeenCalledWith('a', 'b');
  });

  test('delAllBookmarkListCaches deletes bookmark list pattern', async () => {
    await delAllBookmarkListCaches();

    expect(cacheDelPatternMock).toHaveBeenCalledTimes(1);
    expect(cacheDelPatternMock).toHaveBeenCalledWith('bookmarks:list:*');
  });
});
