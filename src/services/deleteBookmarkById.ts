import type { IBookmark } from '../types/bookmarkType';
import { delAllBookmarkListCaches, delKeys } from '../middleware/cache';
import { deleteBookmark, findBookmarkById } from '../repositories/bookmarkRepository';
import { ApiErrorCode } from '../types/errorType';
import { createAppError } from '../repositories/errorFactory';

export const deleteBookmarkById = async (id: number): Promise<IBookmark> => {
  const numId = Number(id);

  if (!id || Number.isNaN(numId) || numId <= 0) {
    throw createAppError(ApiErrorCode.INVALID_ID, 400, 'The bookmark id provided is invalid', [
      { field: 'id', message: 'Expected a valid positive integer ID' },
    ]);
  }

  const bookmark = findBookmarkById(numId);

  if (!bookmark) {
    throw createAppError(ApiErrorCode.NOT_FOUND, 404, 'This bookmark could not be found', [
      { field: 'id', message: `No bookmark with id ${numId}` },
    ]);
  }

  deleteBookmark(numId);
  await delKeys(`bookmarks:${numId}`);
  await delAllBookmarkListCaches();

  return bookmark;
};
