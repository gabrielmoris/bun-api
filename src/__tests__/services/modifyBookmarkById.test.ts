import { expect, test, describe, beforeAll, beforeEach, mock } from 'bun:test';
import { mockedBookmarks } from '../mocks/bookmarks.mock';
import { modifyBookmarkById } from '../../services/modifyBookmarkById';
import { delAllBookmarkListCachesMock, mockCache } from '../mocks/redis.mock';
import { findAndUpdateBookmarkMock, mockBookmarkRepository } from '../mocks/db.mock';

const bookmarkToModify = {
  url: 'http://i-am-modified.com',
};

describe('Bookmarks creation', () => {
  beforeAll(() => {
    mockBookmarkRepository();
    mockCache();
  });

  beforeEach(() => {
    findAndUpdateBookmarkMock.mockClear();
    delAllBookmarkListCachesMock.mockClear();
  });

  test('It modifies a Bookmark by ID and clears cache', async () => {
    const result = await modifyBookmarkById(1, bookmarkToModify);
    const oldBookmark = { ...mockedBookmarks[0] };

    expect(findAndUpdateBookmarkMock).toHaveBeenCalledWith(1, bookmarkToModify);

    expect(delAllBookmarkListCachesMock).toHaveBeenCalledTimes(1);

    expect(result).toMatchObject({
      ...oldBookmark,
      url: 'http://i-am-modified.com',
      updated_at: expect.any(String),
    });
  });

  test('It fails with the proper error if the ID is not valid and the cache is not cleared.', async () => {
    expect(
      modifyBookmarkById('69fcf6c34eb330810c7f6d8ds' as unknown as number, bookmarkToModify)
    ).rejects.toMatchObject({
      code: 'INVALID_ID',
      message: 'The bookmark id provided is invalid',
      details: [
        {
          field: 'id',
          message: 'Expected a valid positive integer ID',
        },
      ],
    });

    expect(delAllBookmarkListCachesMock).not.toHaveBeenCalled();

    expect(findAndUpdateBookmarkMock).not.toHaveBeenCalled();
  });

  test('Sends proper error when there is no Bookmark with that ID and the cache is not cleared.', async () => {
    expect(modifyBookmarkById(10, bookmarkToModify)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'This bookmark could not be found',
      details: [
        {
          field: 'id',
          message: 'No bookmark with id 10',
        },
      ],
    });

    expect(delAllBookmarkListCachesMock).not.toHaveBeenCalled();

    expect(findAndUpdateBookmarkMock).toHaveBeenCalledWith(10, bookmarkToModify);
  });
});
