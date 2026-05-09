import Bookmark from "../db/bookmarkModel";
import { connectDB } from "../db/mongo";

export const getPaginatedBookmarks = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;
    await connectDB();

    const [bookmarks, total] = await Promise.all([
      Bookmark.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Bookmark.countDocuments({}),
    ]);

    return { total, bookmarks };
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
