import type { DeleteResult } from "mongoose";
import Bookmark, { type IBookmark } from "../db/bookmarkModel";
import type { BookmarkType } from "../types/bookmarkType";
import { connectDB } from "../db/mongo";

async function withDB<T>(fn: () => Promise<T>): Promise<T> {
  await connectDB();
  return fn();
}

export async function findBookmarkById(id: string): Promise<IBookmark | null> {
  return withDB(() => Bookmark.findById(id));
}

export async function findBookmarkByUrl(
  url: string,
): Promise<IBookmark | null> {
  return withDB(() => Bookmark.findOne({ url: url }));
}

export async function findPaginatedBookmarks(skip: number, limit: number) {
  const [bookmarks, total] = await Promise.all([
    withDB(() =>
      Bookmark.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ),
    withDB(() => Bookmark.countDocuments({})),
  ]);

  return { total, bookmarks };
}

export async function createBookmarkInDb(
  data: BookmarkType,
): Promise<IBookmark> {
  return withDB(() => Bookmark.create(data));
}

export async function findAndUpdateBookmark(
  id: string,
  update: Partial<BookmarkType>,
): Promise<IBookmark | null> {
  return withDB(() =>
    Bookmark.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }),
  );
}

export async function deleteBookmark(id: string): Promise<DeleteResult> {
  return withDB(() => Bookmark.deleteOne({ _id: id }));
}
