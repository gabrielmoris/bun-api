import { getDB } from '../db/sqlite';

export function runRateLimitHits(
  scope: string,
  clientId: string,
  windowStart: number,
  limit: number,
  windowMiliseconds: number,
  now: number
) {
  const db = getDB();
  return db.transaction(() => {
    db.run(
      `DELETE FROM rate_limit_hits
         WHERE scope = ? AND client_id = ? AND created_at < ?`,
      [scope, clientId, windowStart]
    );

    const count = db
      .query(
        `SELECT COUNT(*) AS count
           FROM rate_limit_hits
           WHERE scope = ? AND client_id = ?`
      )
      .get(scope, clientId) as { count: number };

    if (count.count >= limit) {
      const oldest = db
        .query(
          `SELECT created_at
             FROM rate_limit_hits
             WHERE scope = ? AND client_id = ?
             ORDER BY created_at ASC
             LIMIT 1`
        )
        .get(scope, clientId) as { created_at: number } | undefined;

      return {
        allowed: false,
        retryAfter: oldest ? Math.ceil((oldest.created_at + windowMiliseconds - now) / 1000) : 60,
      };
    }

    db.run(
      `INSERT INTO rate_limit_hits (scope, client_id, created_at)
         VALUES (?, ?, ?)`,
      [scope, clientId, now]
    );

    return { allowed: true, retryAfter: 0, currentCount: count.count + 1 };
  });
}
