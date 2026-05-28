import { getDB } from './sqlite';

export function initCacheTable() {
  const db = getDB();
  db.run(`
     CREATE TABLE IF NOT EXISTS cache (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        expires_at INTEGER NOT NULL
    )
  `);
}
