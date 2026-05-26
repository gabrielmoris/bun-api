import type { BunRequest } from 'bun';
import { getPaginatedBookmarks } from '../../services/getPaginatedBookmarks';
import { withCors } from '../../middleware/cors';

export const getBookmarks = async (req: BunRequest): Promise<Response> => {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 20;

  const { total, bookmarks } = await getPaginatedBookmarks(page, limit);

  return withCors(
    req,
    Response.json(
      {
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: bookmarks,
      },
      { status: 200 }
    )
  );
};
