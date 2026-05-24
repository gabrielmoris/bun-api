import type { BunRequest } from "bun";
import { handlePreflight, withCors } from "../middleware/cors";
import { withErrorHandler } from "../middleware/errorHandler";
import { withRateLimit } from "../middleware/rateLimit";
import { deleteById } from "./bookmarks/delete";
import { getBookmarks } from "./bookmarks/get";
import { getById } from "./bookmarks/getById";
import { postBookmark } from "./bookmarks/post";
import { putById } from "./bookmarks/putById";

type Handler = (req: BunRequest) => Response | Promise<Response>;

function withMiddleware(handler: Handler): Handler {
  return withRateLimit(withErrorHandler(handler));
}

export const routes = {
  "/health": (req: BunRequest) => withCors(req, new Response("OK")),
  "/bookmarks": {
    POST: withMiddleware(postBookmark),
    GET: withMiddleware(getBookmarks),
  },

  "/bookmarks/:id": {
    OPTIONS: (req: BunRequest) => handlePreflight(req),
    GET: withMiddleware(getById),
    PUT: withMiddleware(putById),
    DELETE: withMiddleware(deleteById),
  },
};

export type Routes = typeof routes;
