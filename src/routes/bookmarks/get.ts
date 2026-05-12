import type { BunRequest } from "bun";
import { getPaginatedBookmarks } from "../../services/getPaginatedBookmarks";
import { withCors } from "../../middleware/cors";

export const getBookmarks = async (req: BunRequest) => {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;

    const { total, bookmarks, error } = await getPaginatedBookmarks(
      page,
      limit,
    );

    if (error) {
      return withCors(req, Response.json(error, { status: 409 }));
    }

    return withCors(
      req,
      Response.json(
        {
          success: true,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          data: bookmarks,
        },
        { status: 200 },
      ),
    );
  } catch (e) {
    return withCors(
      req,
      Response.json(
        {
          error: {
            code: "UNKNOWN_ERROR",
            message: e instanceof Error ? e.message : "Unknown error",
            details: [
              {
                field: "unknown",
                message: "Unknown error happened retrieving Bookmarks",
              },
            ],
          },
        },
        { status: 500 },
      ),
    );
  }
};
