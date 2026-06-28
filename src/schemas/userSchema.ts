import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(4).max(15),
  password: z.string().trim().min(6).max(24),
});

export const updateUserSchema = createUserSchema.partial().strict();
