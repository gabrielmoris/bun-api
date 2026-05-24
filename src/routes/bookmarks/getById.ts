import type { BunRequest } from "bun";
import { getBookmarkById } from "../../services/getBookmarkById";
import { withCors } from "../../middleware/cors";
import { createAppError } from "../../repositories/errorFactory";
import { ApiErrorCode } from "../../types/errorType";

export const getById = async (req: BunRequest): Promise<Response> => {
  const { id } = req.params;

  if (!id) {
    throw createAppError(ApiErrorCode.BAD_REQUEST, 400, "Bad Request", [
      { field: "unknown", message: "No id provided" },
    ]);
  }

  const bookmark = await getBookmarkById(Number(id));

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
