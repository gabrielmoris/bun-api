import type { BunRequest } from "bun";
import { createBookmarkSchema } from "../../schemas/bookmarkSchema";
import type { BookmarkType } from "../../types/bookmarkType";
import { createBookmark } from "../../services/createBookmark";
import { withCors } from "../../middleware/cors";

export const postBookmark = async (req: BunRequest) => {
  try {
    const rawBody: unknown = await req.json();

    const result = createBookmarkSchema.safeParse(rawBody);

    if (!result.success) {
      return withCors(
        req,
        Response.json(
          {
            error: result.error.issues,
          },
          { status: 400 },
        ),
      );
    }

    const body: BookmarkType = result.data;
    const { error, data } = await createBookmark(body);

    if (error) {
      return withCors(req, Response.json(error, { status: 409 }));
    }

    return withCors(
      req,
      Response.json({ created: true, ...data }, { status: 201 }),
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
                message: "Unknown error happened saving a Bookmark",
              },
            ],
          },
        },
        { status: 500 },
      ),
    );
  }
};
