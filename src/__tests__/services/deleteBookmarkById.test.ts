import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { deleteBookmarkMock, findBookmarkByIdMock, mockBookmarkRepository } from '../mocks/db.mock';
import { mockedBookmarks } from '../mocks/bookmarks.mock';
import { cacheDelMock, cacheDelPatternMock, mockCacheRepository } from '../mocks/cache.mock';

mockBookmarkRepository();
mockCacheRepository();

const { deleteBookmarkById } = await import('../../services/deleteBookmarkById');
describe('deleteBookmarkById', () => {
  beforeEach(() => {
    mock.clearAllMocks();
  });

  test('deletes a bookmark by ID and invalidates caches', async () => {
    const bookmarkToDelete = mockedBookmarks[0];

    if (!bookmarkToDelete) {
      throw new Error('Test setup failed: mockedBookmarks[0] is missing');
    }

    findBookmarkByIdMock.mockReturnValueOnce(bookmarkToDelete);

    const result = await deleteBookmarkById(bookmarkToDelete.id);

    expect(findBookmarkByIdMock).toHaveBeenCalledWith(bookmarkToDelete.id);
    expect(deleteBookmarkMock).toHaveBeenCalledWith(bookmarkToDelete.id);
    expect(cacheDelMock).toHaveBeenCalledWith(`bookmarks:${bookmarkToDelete.id}`);
    expect(cacheDelPatternMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(bookmarkToDelete);
  });

  test('throws INVALID_ID when the id is not a valid positive integer', async () => {
    expect(deleteBookmarkById('sorry' as unknown as number)).rejects.toEqual(
      expect.objectContaining({
        code: 'INVALID_ID',
        message: 'The bookmark id provided is invalid',
        details: [{ field: 'id', message: 'Expected a valid positive integer ID' }],
      })
    );

    expect(findBookmarkByIdMock).not.toHaveBeenCalled();
    expect(deleteBookmarkMock).not.toHaveBeenCalled();
    expect(cacheDelMock).not.toHaveBeenCalled();
    expect(cacheDelPatternMock).not.toHaveBeenCalled();
  });

  test('throws NOT_FOUND when no bookmark exists with the given id', async () => {
    findBookmarkByIdMock.mockReturnValueOnce(null);

    expect(deleteBookmarkById(999)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'This bookmark could not be found',
      details: [{ field: 'id', message: 'No bookmark with id 999' }],
    });

    expect(findBookmarkByIdMock).toHaveBeenCalledWith(999);
    expect(deleteBookmarkMock).not.toHaveBeenCalled();
    expect(cacheDelMock).not.toHaveBeenCalled();
    expect(cacheDelPatternMock).not.toHaveBeenCalled();
  });
});
