import type { BunRequest } from "bun";
import { deleteBookmarkById } from "../../services/deleteBookmarkById";
import { withCors } from "../../middleware/cors";
import { createAppError } from "../../middleware/errorFactory";
import { ApiErrorCode } from "../../types/errorType";

export const deleteById = async (req: BunRequest): Promise<Response> => {
  const { id } = req.params;

  if (!id) {
    throw createAppError(ApiErrorCode.BAD_REQUEST, 400, "Bad Request", [
      { field: "unknown", message: "No id provided" },
    ]);
  }

  const bookmark = await deleteBookmarkById(Number(id));

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
