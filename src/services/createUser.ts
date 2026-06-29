import { ApiErrorCode } from '../types/errorType';
import { createAppError } from '../repositories/errorFactory';
import type { User } from '../types/userTypes';
import { createUserInDb, findUserByName } from '../repositories/userRepository';

export const createUser = async (user: Partial<User>): Promise<User> => {
  const missingFields = ['name', 'password', 'repeatPassword'].filter(
    field => !Object.hasOwn(user, field)
  );

  if (missingFields.length > 0) {
    throw createAppError(
      ApiErrorCode.MISSING_ENTRY,
      400,
      `Missing required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`,
      missingFields.map(field => ({
        field,
        message: `${field} is required`,
      }))
    );
  }

  const existing = findUserByName(user.name!);

  if (existing) {
    throw createAppError(ApiErrorCode.DUPLICATED_ENTRY, 409, 'This user is already registered', [
      { field: 'name', message: 'Duplicated name' },
    ]);
  }

  // TODO: Hash password

  const createdUser = createUserInDb(user as User);

  return createdUser;
};
