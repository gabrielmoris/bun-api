import type { BunRequest } from "bun";
import { createBookmarkSchema } from "../../schemas/bookmarkSchema";

export const createBookmark = async (_req: BunRequest) => {
  const body: any = await _req.json();

  const result = createBookmarkSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        error: result.error?.issues,
      },
      { status: 400 },
    );
  }

  return Response.json({ created: true, ...body });
};
