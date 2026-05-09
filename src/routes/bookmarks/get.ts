import type { BunRequest } from "bun";
import { getPaginatedBookmarks } from "../../services/getPaginatedBookmarks";

export const getBookmarks = async (_req: BunRequest) => {
  try {
    const url = new URL(_req.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;

    const { total, bookmarks, error } = await getPaginatedBookmarks(
      page,
      limit,
    );

    if (error) {
      return Response.json(error, { status: 409 });
    }

    return Response.json(
      {
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: bookmarks,
      },
      { status: 200 },
    );
  } catch (e) {
    return Response.json(
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
    );
  }
};
