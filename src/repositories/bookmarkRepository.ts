import type { DeleteResult } from "mongoose";
import Bookmark, { type IBookmark } from "../db/bookmarkModel";
import type { BookmarkType } from "../types/bookmarkType";

export async function findBookmarkById(id: string): Promise<IBookmark | null> {
  return Bookmark.findById(id);
}

export async function findBookmarkByUrl(
  url: string,
): Promise<IBookmark | null> {
  return Bookmark.findOne({ url: url });
}

export async function findPaginatedBookmarks(skip: number, limit: number) {
  const [bookmarks, total] = await Promise.all([
    Bookmark.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Bookmark.countDocuments({}),
  ]);

  return { total, bookmarks };
}

export async function createBookmarkInDb(
  data: BookmarkType,
): Promise<IBookmark> {
  return Bookmark.create(data);
}

export async function findAndUpdateBookmark(
  id: string,
  update: Partial<BookmarkType>,
): Promise<IBookmark | null> {
  return Bookmark.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
}

export async function deleteBookmark(id: string): Promise<DeleteResult> {
  return Bookmark.deleteOne({ _id: id });
}
