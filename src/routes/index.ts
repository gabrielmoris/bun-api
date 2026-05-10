import { getBookmarks } from "./bookmarks/get";
import { getById } from "./bookmarks/getById";
import { postBookmark } from "./bookmarks/post";

export const routes = {
  "/health": new Response("OK"),
  "/bookmarks": {
    POST: postBookmark,
    GET: getBookmarks,
  },

  //TODO: PUT and Tests
  "/bookmarks/:id": {
    GET: getById,
  },
};

export type Routes = typeof routes;
