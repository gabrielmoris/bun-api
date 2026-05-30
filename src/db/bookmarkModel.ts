import type { IBookmark, RawBookmark } from '../types/bookmarkType';
import { getDB } from './sqlite';

export function initBookmarksTable() {
  const db = getDB();
  db.run(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      url         TEXT    NOT NULL UNIQUE,
      title       TEXT    NOT NULL,
      description TEXT,
      tags        TEXT    DEFAULT '[]',  -- JSON-serialized string[]
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export function deserialize(row: RawBookmark): IBookmark {
  return { ...row, tags: JSON.parse(row.tags ?? '[]') };
}

export function pruneBookmarksTable() {
  const db = getDB();
  db.prepare('DELETE FROM bookmarks').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name="bookmarks"').run();
}
