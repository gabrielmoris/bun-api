import { getDB } from '../db/sqlite';

export function now() {
  return Math.floor(Date.now() / 1000);
}

const db = getDB();

export function cacheGet(key: string): string | null {
  const row = db
    .query<
      { value: string },
      [string, number]
    >('SELECT value FROM cache WHERE key = ? AND expires_at > ?')
    .get(key, now());
  return row?.value ?? null;
}

export function cacheSet(key: string, ttlSec: number, value: string) {
  db.run(
    `INSERT INTO cache (key, value, expires_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at`,
    [key, value, now() + ttlSec]
  );
}

export function cacheDel(...keys: string[]) {
  const placeholders = keys.map(() => '?').join(', ');
  db.run(`DELETE FROM cache WHERE key IN (${placeholders})`, keys);
}

export function cacheDelPattern(pattern: string) {
  const likePattern = pattern.replace(/\*/g, '%');
  db.run('DELETE FROM cache WHERE key LIKE ?', [likePattern]);
}

export function clearOldEntries() {
  db.run('DELETE FROM cache WHERE expires_at <= ?', [now()]);
}
