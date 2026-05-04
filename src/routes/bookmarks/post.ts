import type { BunRequest } from "bun";

export const postBookmarks = async (_req: BunRequest) => {
  const body: any = await _req.json();

  console.log(body);

  return Response.json({ created: true, ...body });
};
