import { findPaginatedBookmarks } from '../repositories/bookmarkRepository';
import { cacheKeys, getOrSet } from '../repositories/cache';
import { createAppError } from '../repositories/errorFactory';
import type { IBookmark } from '../types/bookmarkType';
import { ApiErrorCode, type ApiErrorDetail } from '../types/errorType';

export const getPaginatedBookmarks = async (
  page: number,
  limit: number
): Promise<{ total: number; bookmarks: IBookmark[] }> => {
  const errors: Array<ApiErrorDetail> = [];

  if (!Number.isFinite(page) || !Number.isInteger(page) || page < 1) {
    errors.push({
      field: 'page',
      message: 'Page must be a positive integer',
    });
  }

  if (!Number.isFinite(limit) || !Number.isInteger(limit) || limit < 1) {
    errors.push({
      field: 'limit',
      message: 'Limit must be a positive integer',
    });
  }

  if (errors.length > 0) {
    throw createAppError(
      ApiErrorCode.BAD_REQUEST,
      400,
      `Wrong required field${errors.length > 1 ? 's' : ''}: ${errors.map(err => err.field).join(', ')}`,
      errors
    );
  }

  const skip = (page - 1) * limit;

  return getOrSet({
    key: cacheKeys.bookmarksPage(page, limit),
    ttlSec: 30,
    loader: async () => {
      return findPaginatedBookmarks(skip, limit);
    },
  });
};
