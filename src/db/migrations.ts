import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDB } from './sqlite';

type AppliedMigration = {
  id: number;
};

(function runMigrations(): void {
  const db = getDB();
  const migrationDir = join(import.meta.dir, '../../backupsDb');

  mkdirSync(migrationDir, { recursive: true });

  db.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const files = readdirSync(migrationDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  for (const file of files) {
    const already = db
      .prepare('SELECT id FROM _migrations WHERE name = ?')
      .get(file) as AppliedMigration | null;

    if (already) {
      console.log(`↩ Skipping ${file}`);
      continue;
    }

    const sql = readFileSync(join(migrationDir, file), 'utf-8').trim();

    if (!sql) {
      console.log(`⚠ Empty migration: ${file}`);
      continue;
    }

    db.run('BEGIN');

    try {
      db.run(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
      db.run('COMMIT');
      console.log(`✅ Applied ${file}`);
    } catch (error) {
      db.run('ROLLBACK');
      console.error(`❌ Failed ${file}`);
      throw error;
    }
  }
})();
