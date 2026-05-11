import { deleteById } from "./bookmarks/delete";
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

  //TODO: Rate limiting, CORS, cache, GH actions, upload to Railway
  "/bookmarks/:id": {
    GET: getById,
    PUT: putById,
    DELETE: deleteById,
  },
};

export type Routes = typeof routes;
