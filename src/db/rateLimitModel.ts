import { getDB } from './sqlite';

export function initRateLimitTable() {
  const db = getDB();
  db.run(`
    CREATE TABLE IF NOT EXISTS rate_limit_hits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT NOT NULL,
    client_id TEXT NOT NULL,
    created_at INTEGER NOT NULL
    );
  `);
}

export function pruneRateLimitsTable() {
  const db = getDB();
  db.prepare('DELETE FROM rate_limit_hits').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name="rate_limit_hits"').run();
}
