import { getBookmarks } from "./bookmarks/get";
import { postBookmark } from "./bookmarks/post";

export const routes = {
  "/bookmarks": {
    GET: getBookmarks,
    POST: postBookmark,
  },
};

export type Routes = typeof routes;
