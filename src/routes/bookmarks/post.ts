import type { BunRequest } from "bun";
import { createBookmarkSchema } from "../../schemas/bookmarkSchema";
import { connectDB } from "../../db/mongo";
import Bookmark from "../../db/bookmarkModel";

export const createBookmark = async (_req: BunRequest) => {
  console.log("\n\n HEY!!!");
  try {
    const rawBody: any = await _req.json();

    const result = createBookmarkSchema.safeParse(rawBody);

    if (!result.success) {
      return Response.json(
        {
          error: result.error?.issues,
        },
        { status: 400 },
      );
    }

    const body = result.data;

    await connectDB();

    const bookmark = await Bookmark.findOne({ url: body.url });

    if (bookmark) {
      return Response.json(
        {
          error: {
            code: "DUPLICATED_ENTRY",
            message: "This url is already in your database",
            details: [{ field: "url", message: "Duplicated url" }],
          },
        },
        { status: 409 },
      );
    }

    const saved = await Bookmark.create(body);

    return Response.json({ created: true, ...saved }, { status: 201 });
  } catch (e) {
    console.log(e);
    return Response.json(
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
    );
  }
};
