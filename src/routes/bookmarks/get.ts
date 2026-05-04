import type { BunRequest } from "bun";

export const getBookmarks = async (_req: BunRequest) => {
  return new Response("OK");
};
