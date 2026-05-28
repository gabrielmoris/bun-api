import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { findBookmarkByIdMock, mockBookmarkRepository } from '../mocks/db.mock';
import { mockedBookmarks } from '../mocks/bookmarks.mock';
import { cacheDelPatternMock, mockCacheRepository } from '../mocks/cache.mock';
import type { IBookmark } from '../../types/bookmarkType';

mockBookmarkRepository();
mockCacheRepository();

const { getBookmarkById } = await import('../../services/getBookmarkById');

describe('Bookmarks creation', () => {
  beforeEach(() => {
    mock.clearAllMocks();
  });

  test('It gets the a Bookmark by ID', async () => {
    const result = await getBookmarkById(1);
    expect(findBookmarkByIdMock).toHaveBeenCalledWith(1);
    expect(result).toMatchObject(mockedBookmarks[0] as IBookmark);
    expect(cacheDelPatternMock).not.toHaveBeenCalled();
  });

  test('It fails with the proper error if the ID is not valid', async () => {
    expect(getBookmarkById('69fcf6c34eb330810c7f6d8ds' as unknown as number)).rejects.toMatchObject(
      {
        code: 'INVALID_ID',
        statusCode: 400,
        message: 'The bookmark id provided is invalid',
        details: [
          {
            field: 'id',
            message: 'Expected a valid positive integer ID',
          },
        ],
      }
    );

    expect(findBookmarkByIdMock).not.toHaveBeenCalled();
    expect(cacheDelPatternMock).not.toHaveBeenCalled();
  });

  test('Sends proper error when there is no Bookmark with that ID', async () => {
    expect(getBookmarkById(7)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      statusCode: 404,
      message: 'This bookmark could not be found',
      details: [
        {
          field: 'id',
          message: 'No bookmark with id 7',
        },
      ],
    });

    expect(findBookmarkByIdMock).toHaveBeenCalled();
    expect(cacheDelPatternMock).not.toHaveBeenCalled();
  });
});
