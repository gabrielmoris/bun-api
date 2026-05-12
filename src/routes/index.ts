import { handlePreflight, withCors } from "../middleware/cors";
import { deleteById } from "./bookmarks/delete";
import { getBookmarks } from "./bookmarks/get";
import { getById } from "./bookmarks/getById";
import { postBookmark } from "./bookmarks/post";
import { putById } from "./bookmarks/putById";

export const routes = {
  "/health": (req: Request) => withCors(req, new Response("OK")),
  "/bookmarks": {
    POST: postBookmark,
    GET: getBookmarks,
  },

  //TODO: Rate limiting, cache, upload to Railway
  "/bookmarks/:id": {
    OPTIONS: (req: Request) => handlePreflight(req),
    GET: getById,
    PUT: putById,
    DELETE: deleteById,
  },
};

export type Routes = typeof routes;
