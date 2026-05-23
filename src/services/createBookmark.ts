import type { ApiError } from "../types/errorType";
import { delAllBookmarkListCaches } from "../repositories/cache";
import { createBookmarkInDb, findBookmarkByUrl } from "../repositories/bookmarkRepository";
import type { IBookmark } from "../types/bookmarkType";

export const createBookmark = async (bookmark: IBookmark): Promise<ApiError | any> => {
  try {
    const isBookmarkInDatabase = findBookmarkByUrl(bookmark.url);

    if (isBookmarkInDatabase) {
      return {
        error: {
          code: "DUPLICATED_ENTRY",
          message: "This url is already in your database",
          details: [{ field: "url", message: "Duplicated url" }],
        },
      };
    }

    const createdBookmark = createBookmarkInDb(bookmark);
    await delAllBookmarkListCaches();

    return { data: createdBookmark };
  } catch (e) {
    return {
      error: {
        code: "UNKNOWN_ERROR",
        message: e instanceof Error ? e.message : "Unknown error",
        details: [
          {
            field: "unknown",
            message: "Unknown error happened saving a Bookmark",
          },
        ],
      },
    };
  }
};
