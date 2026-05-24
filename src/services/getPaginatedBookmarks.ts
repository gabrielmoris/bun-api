import { findPaginatedBookmarks } from "../repositories/bookmarkRepository";
import { cacheKeys, getOrSet } from "../repositories/cache";
import type { IBookmark } from "../types/bookmarkType";

export const getPaginatedBookmarks = async (
  page: number,
  limit: number,
): Promise<{ total: number; bookmarks: IBookmark[] }> => {
  const skip = (page - 1) * limit;

  return getOrSet({
    key: cacheKeys.bookmarksPage(page, limit),
    ttlSec: 30,
    loader: async () => {
      return findPaginatedBookmarks(skip, limit);
    },
  });
};
