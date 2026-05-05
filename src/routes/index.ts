import { getBookmarks } from "./bookmarks/get";
import { createBookmark } from "./bookmarks/post";

export const routes = {
  "/bookmarks": {
    GET: getBookmarks,
    POST: createBookmark,
  },
};

export type Routes = typeof routes;
