import { findPaginatedBookmarks } from "../repositories/bookmarkRepository";
import { cacheKeys, getOrSet } from "../repositories/cache";

export const getPaginatedBookmarks = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    return await getOrSet({
      key: cacheKeys.bookmarksPage(page, limit),
      ttlSec: 30,
      loader: async () => {
        return await findPaginatedBookmarks(skip, limit);
      },
    });
  } catch (e) {
    return {
      error: {
        code: "UNKNOWN_ERROR",
        message: e instanceof Error ? e.message : "Unknown error",
        details: [
          {
            field: "unknown",
            message: "Unknown error happened retrieving Bookmarks",
          },
        ],
      },
    };
  }
};
