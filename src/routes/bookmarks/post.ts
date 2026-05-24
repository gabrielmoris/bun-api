import type { BunRequest } from "bun";
import { createBookmarkSchema } from "../../schemas/bookmarkSchema";
import { createBookmark } from "../../services/createBookmark";
import { withCors } from "../../middleware/cors";
import { createAppError } from "../../middleware/errorFactory";
import { ApiErrorCode } from "../../types/errorType";

export const postBookmark = async (req: BunRequest): Promise<Response> => {
  const rawBody: unknown = await req.json();

  const result = createBookmarkSchema.safeParse(rawBody);

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

  const bookmark = await createBookmark(result.data);

  return withCors(
    req,
    Response.json({ created: true, ...bookmark }, { status: 201 }),
  );
};
