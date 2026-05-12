import type { BunRequest } from "bun";
import { modifyBookmarkById } from "../../services/modifyBookmarkById";
import { updateBookmarkSchema } from "../../schemas/bookmarkSchema";
import type { BookmarkType } from "../../types/bookmarkType";
import { withCors } from "../../middleware/cors";

export const putById = async (req: BunRequest) => {
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

    const rawBody: any = await req.json();
    const result = updateBookmarkSchema.safeParse(rawBody);

    if (!result.success) {
      return withCors(
        req,
        Response.json(
          {
            error: result.error?.issues,
          },
          { status: 400 },
        ),
      );
    }

    const body: Partial<BookmarkType> = result.data;

    const { bookmark, error } = await modifyBookmarkById(id, body);

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
