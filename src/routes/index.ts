import type { BunRequest } from "bun";
import { handlePreflight, withCors } from "../middleware/cors";
import { withRateLimit } from "../middleware/rateLimit";
import { deleteById } from "./bookmarks/delete";
import { getBookmarks } from "./bookmarks/get";
import { getById } from "./bookmarks/getById";
import { postBookmark } from "./bookmarks/post";
import { putById } from "./bookmarks/putById";

export const routes = {
  "/health": (req: BunRequest) => withCors(req, new Response("OK")),
  "/bookmarks": {
    POST: withRateLimit(postBookmark),
    GET: withRateLimit(getBookmarks),
  },

  // TODO: Rate limiting, upload to Railway
  "/bookmarks/:id": {
    OPTIONS: (req: BunRequest) => handlePreflight(req),
    GET: withRateLimit(getById),
    PUT: withRateLimit(putById),
    DELETE: withRateLimit(deleteById),
  },
};

export type Routes = typeof routes;
