import { z } from "zod";

export const createBookmarkSchema = z.object({
  url: z.string().trim().url("Invalid URL"),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});
