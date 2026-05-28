import type { IBookmark } from '../types/bookmarkType';
import { delAllBookmarkListCaches, delKeys } from '../middleware/cache';
import { findAndUpdateBookmark } from '../repositories/bookmarkRepository';
import { createAppError } from '../repositories/errorFactory';
import { ApiErrorCode } from '../types/errorType';

export const modifyBookmarkById = async (
  id: number,
  update: Partial<IBookmark>
): Promise<IBookmark> => {
  const numId = Number(id);

  if (!id || isNaN(numId) || numId <= 0) {
    throw createAppError(ApiErrorCode.INVALID_ID, 400, 'The bookmark id provided is invalid', [
      { field: 'id', message: 'Expected a valid positive integer ID' },
    ]);
  }

  const bookmark = findAndUpdateBookmark(numId, update);

  if (!bookmark) {
    throw createAppError(ApiErrorCode.NOT_FOUND, 404, 'This bookmark could not be found', [
      { field: 'id', message: `No bookmark with id ${numId}` },
    ]);
  }

  await delKeys(`bookmarks:${numId}`);
  await delAllBookmarkListCaches();

  return bookmark;
};
