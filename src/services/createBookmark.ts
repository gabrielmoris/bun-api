import { delAllBookmarkListCaches } from '../middleware/cache';
import { createBookmarkInDb, findBookmarkByUrl } from '../repositories/bookmarkRepository';
import type { IBookmark } from '../types/bookmarkType';
import { ApiErrorCode } from '../types/errorType';
import { createAppError } from '../repositories/errorFactory';

export const createBookmark = async (bookmark: Partial<IBookmark>): Promise<IBookmark> => {
  const missingFields = ['url', 'title'].filter(field => !Object.hasOwn(bookmark, field));

  if (missingFields.length > 0) {
    throw createAppError(
      ApiErrorCode.MISSING_ENTRY,
      400,
      `Missing required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`,
      missingFields.map(field => ({
        field,
        message: `${field} is required`,
      }))
    );
  }

  const existing = findBookmarkByUrl(bookmark.url!);

  if (existing) {
    throw createAppError(
      ApiErrorCode.DUPLICATED_ENTRY,
      409,
      'This url is already in your database',
      [{ field: 'url', message: 'Duplicated url' }]
    );
  }

  const createdBookmark = createBookmarkInDb(bookmark as IBookmark);
  await delAllBookmarkListCaches();

  return createdBookmark;
};
