import { getDB } from '../db/sqlite';
import type { User } from '../types/userTypes';

export function findUserByName(name: string): User | null {
  const row = getDB().prepare('SELECT * FROM users WHERE name = ?').get(name) as User | null;

  return row;
}

export function createUserInDb(data: User): User {
  const result = getDB()
    .prepare(
      `INSERT INTO bookmarks (name, password)
       VALUES (?, ?)
       RETURNING *`
    )
    .get(data.name, data.id, data.created_at) as User;

  return result;
}
