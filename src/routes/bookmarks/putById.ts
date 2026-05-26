import type { BunRequest } from "bun";
import { modifyBookmarkById } from "../../services/modifyBookmarkById";
import { updateBookmarkSchema } from "../../schemas/bookmarkSchema";
import type { IBookmark } from "../../types/bookmarkType";
import { withCors } from "../../middleware/cors";
import { createAppError } from "../../repositories/errorFactory";
import { ApiErrorCode } from "../../types/errorType";

export const putById = async (req: BunRequest): Promise<Response> => {
  const { id } = req.params;

  if (!id) {
    throw createAppError(ApiErrorCode.BAD_REQUEST, 400, "Bad Request", [
      { field: "unknown", message: "No id provided" },
    ]);
  }

  const rawBody: unknown = await req.json();
  const result = updateBookmarkSchema.safeParse(rawBody);

  if (!result.success) {
    throw createAppError(
      ApiErrorCode.VALIDATION_ERROR,
      400,
      "Invalid request body",
      result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    );
  }

  const body: Partial<IBookmark> = result.data;
  const bookmark = await modifyBookmarkById(Number(id), body);

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
};
