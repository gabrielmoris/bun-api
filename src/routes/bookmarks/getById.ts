import type { BunRequest } from "bun";
import { getBookmarkById } from "../../services/getBookmarkById";
import { withCors } from "../../middleware/cors";

export const getById = async (req: BunRequest) => {
  try {
    const { id } = req.params;

    if (!id) {
      return withCors(
        req,
        Response.json(
          {
            error: {
              code: "UNKNOWN_ERROR",
              message: "Bad Request",
              details: [
                {
                  field: "unknown",
                  message: "No id provided",
                },
              ],
            },
          },
          { status: 400 },
        ),
      );
    }

    const { bookmark, error } = await getBookmarkById(id);

    if (error) {
      return withCors(
        req,
        Response.json(error, {
          status:
            error.code === "INVAILD_ID"
              ? 400
              : error.code === "NOT_FOUND"
                ? 404
                : 500,
        }),
      );
    }

    return withCors(
      req,
      Response.json(
        {
          success: true,
          data: bookmark,
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
