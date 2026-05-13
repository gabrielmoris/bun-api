import { connectDB } from "../db/mongo";
import Bookmark from "../db/bookmarkModel";
import mongoose from "mongoose";
import type { BookmarkType } from "../types/bookmarkType";
import { delAllBookmarkListCaches, delKeys } from "../repositories/cache";

export const modifyBookmarkById = async (
  id: string,
  update: Partial<BookmarkType>,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        error: {
          code: "INVALID_ID",
          message: "The bookmark id provided is invalid",
          details: [
            {
              field: "id",
              message: "Expected a valid MongoDB ObjectId",
            },
          ],
        },
      };
    }
    await connectDB();

    const bookmark = await Bookmark.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!bookmark) {
      return {
        error: {
          code: "NOT_FOUND",
          message: "This bookmark could not be found",
          details: [
            {
              field: "id",
              message: `No bookmark with id ${id}`,
            },
          ],
        },
      };
    }

    await delKeys(`bookmarks:${id}`);
    await delAllBookmarkListCaches();
    return { bookmark };
  } catch (e) {
    return {
      error: {
        code: "UNKNOWN_ERROR",
        message: e instanceof Error ? e.message : "Unknown error",
        details: [
          {
            field: "unknown",
            message: "Unknown error happened retrieving Bookmark",
          },
        ],
      },
    };
  }
};
