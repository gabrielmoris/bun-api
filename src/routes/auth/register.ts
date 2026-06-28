import type { BunRequest } from 'bun';
import { withCors } from '../../middleware/cors';
import { createUserSchema } from '../../schemas/userSchema';
import { createAppError } from '../../repositories/errorFactory';
import { ApiErrorCode } from '../../types/errorType';

const ACCESS_TOKEN_EXPIRY = '15m';

export const register = async (req: BunRequest): Promise<Response> => {
  const rawBody: unknown = await req.json();

  const result = createUserSchema.safeParse(rawBody);

  if (!result.success) {
    throw createAppError(
      ApiErrorCode.VALIDATION_ERROR,
      400,
      'Invalid request body',
      result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      }))
    );
  }

  //   const user = await createUSer(result.data);

  //   return withCors(req, Response.json({ created: true, ...user }, { status: 201 }));
  return withCors(req, Response.json(rawBody));
};
