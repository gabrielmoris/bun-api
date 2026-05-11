import { getBookmarks } from "./bookmarks/get";
import { getById } from "./bookmarks/getById";
import { postBookmark } from "./bookmarks/post";
import { putById } from "./bookmarks/putById";

export const routes = {
  "/health": new Response("OK"),
  "/bookmarks": {
    POST: postBookmark,
    GET: getBookmarks,
  },

  //TODO: DELETE and Tests. GH actions, upload to Railway
  "/bookmarks/:id": {
    GET: getById,
    PUT: putById,
  },
};

export type Routes = typeof routes;
