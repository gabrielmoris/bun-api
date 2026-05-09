import { getBookmarks } from "./bookmarks/get";
import { postBookmark } from "./bookmarks/post";

export const routes = {
  "/bookmarks": {
    POST: postBookmark,
    GET: getBookmarks,
  },

  //TODO: 1 test getPaginatedBookmarks, 2 get bookmark by ID, test it, put, test it too
  "/bookmarks/:id": {
    GET: getBookmarks,
  },
};

export type Routes = typeof routes;
