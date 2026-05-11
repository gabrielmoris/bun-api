import type { BunRequest } from "bun";
import { deleteBookmarkById } from "../../services/deleteBookmarkById";

export const deleteById = async (_req: BunRequest) => {
  try {
    const { id } = _req.params;

    if (!id) {
      return Response.json(
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
      );
    }

    const { bookmark, error } = await deleteBookmarkById(id);

    if (error) {
      return Response.json(error, {
        status:
          error.code === "INVAILD_ID"
            ? 400
            : error.code === "NOT_FOUND"
              ? 404
              : 500,
      });
    }

    return Response.json(
      {
        success: true,
        data: bookmark,
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
