import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDB } from './sqlite';
import { initBookmarksTable } from './bookmarkModel';
import { initCacheTable } from './cacheModel';
import { initRateLimitTable } from './rateLimitModel';

type TableRow = {
  name: string;
  sql: string | null;
};

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

function quote(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Uint8Array) {
    return `X'${Buffer.from(value).toString('hex')}'`;
  }

  return `'${String(value).replaceAll("'", "''")}'`;
}

(function exportSchemaAndData(): void {
  initBookmarksTable();
  initCacheTable();
  initRateLimitTable();

  const db = getDB();
  const migrationDir = join(import.meta.dir, '../../backupsDb');

  mkdirSync(migrationDir, { recursive: true });

  const tables = db
    .prepare(
      `
    SELECT name, sql
    FROM sqlite_schema
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
      AND name != '_migrations'
    ORDER BY name ASC
  `
    )
    .all() as TableRow[];

  if (tables.length === 0) {
    throw new Error('No tables found.');
  }

  let index = 1;

  for (const table of tables) {
    if (!table.sql) continue;

    const rows = db.prepare(`SELECT * FROM "${table.name}"`).all() as Record<string, unknown>[];

    const inserts = rows.map(row => {
      const columns = Object.keys(row)
        .map(col => `"${col}"`)
        .join(', ');
      const values = Object.values(row).map(quote).join(', ');
      return `INSERT INTO "${table.name}" (${columns}) VALUES (${values});`;
    });

    const content = [
      `${table.sql.trim()};`,
      inserts.length ? '' : '-- No data',
      ...inserts,
      '',
    ].join('\n');

    const filename = `${pad(index)}_${sanitize(table.name)}.sql`;
    writeFileSync(join(migrationDir, filename), content, 'utf-8');
    console.log(`✅ Created migration: ${filename} (${rows.length} rows)`);
    index++;
  }
})();
