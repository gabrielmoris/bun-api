import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let db: Database | null = null;
let currentPath: string | null = null;

export function getDB(): Database {
  const DB_PATH = process.env.DATABASE_PATH ?? './data/bookmarks.db';

  if (db && currentPath !== DB_PATH) {
    db.close();
    db = null;
  }

  if (!db) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH, { create: true });
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA foreign_keys = ON;');
    currentPath = DB_PATH;
  }

  return db;
}

export function closeDB(): void {
  db?.close();
  db = null;
  currentPath = null;
}
