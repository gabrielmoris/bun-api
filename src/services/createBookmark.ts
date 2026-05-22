import type { ApiError } from "../types/errorType";
import type { BookmarkType } from "../types/bookmarkType";
import { delAllBookmarkListCaches } from "../repositories/cache";
import {
  createBookmarkInDb,
  findBookmarkByUrl,
} from "../repositories/bookmarkRepository";

export const createBookmark = async (
  bookmark: BookmarkType,
): Promise<ApiError | any> => {
  try {
    const isBookmarkInDatabase = await findBookmarkByUrl(bookmark.url);

    if (isBookmarkInDatabase) {
      return {
        error: {
          code: "DUPLICATED_ENTRY",
          message: "This url is already in your database",
          details: [{ field: "url", message: "Duplicated url" }],
        },
      };
    }

    const createdBookmark = await createBookmarkInDb(bookmark);
    await delAllBookmarkListCaches();

    return { data: { ...bookmark, _id: createdBookmark._id } };
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
