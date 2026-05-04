import { getBookmarks } from "./bookmarks/get";
import { postBookmarks } from "./bookmarks/post";

export const routes = {
  "/bookmarks": {
    GET: getBookmarks,
    POST: postBookmarks,
  },
};

export type Routes = typeof routes;
