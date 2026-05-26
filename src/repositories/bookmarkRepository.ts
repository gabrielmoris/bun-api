import { deserialize } from '../db/bookmarkModel';
import { getDB } from '../db/sqlite';
import type { IBookmark, IDeletedBookmark, RawBookmark } from '../types/bookmarkType';

export function findBookmarkById(id: number): IBookmark | null {
  const row = getDB().prepare('SELECT * FROM bookmarks WHERE id = ?').get(id) as
    | RawBookmark
    | undefined;
  return row ? deserialize(row) : null;
}

export function findBookmarkByUrl(url: string): IBookmark | null {
  const row = getDB().prepare('SELECT * FROM bookmarks WHERE url = ?').get(url) as
    | RawBookmark
    | undefined;
  return row ? deserialize(row) : null;
}

export function findPaginatedBookmarks(skip: number, limit: number) {
  const db = getDB();
  const bookmarks = (
    db
      .prepare('SELECT * FROM bookmarks ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(limit, skip) as any[]
  ).map(deserialize);

  const { total } = db.prepare('SELECT COUNT(*) as total FROM bookmarks').get() as any;

  return { total, bookmarks };
}

export function createBookmarkInDb(data: IBookmark): IBookmark {
  const tags = JSON.stringify(data.tags ?? []);
  const result = getDB()
    .prepare(
      `INSERT INTO bookmarks (url, title, description, tags)
       VALUES (?, ?, ?, ?)
       RETURNING *`
    )
    .get(data.url, data.title, data.description ?? null, tags) as RawBookmark;
  return deserialize(result);
}

export function findAndUpdateBookmark(id: number, update: Partial<IBookmark>): IBookmark | null {
  const fields: string[] = [];
  const values: any[] = [];

  if (update.url !== undefined) {
    fields.push('url = ?');
    values.push(update.url);
  }

  if (update.title !== undefined) {
    fields.push('title = ?');
    values.push(update.title);
  }

  if (update.description !== undefined) {
    fields.push('description = ?');
    values.push(update.description);
  }

  if (update.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(update.tags));
  }

  if (fields.length === 0) return findBookmarkById(id);

  fields.push("updated_at = datetime('now')");
  values.push(id);

  const row = getDB()
    .prepare(`UPDATE bookmarks SET ${fields.join(', ')} WHERE id = ? RETURNING *`)
    .get(...values) as RawBookmark | undefined;

  return row ? deserialize(row) : null;
}

export function deleteBookmark(id: number): IDeletedBookmark {
  const result = getDB().prepare('DELETE FROM bookmarks WHERE id = ?').run(id);
  return { deletedCount: result.changes, id };
}
