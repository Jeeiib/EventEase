// Migrations versionnées du schéma, suivies par PRAGMA user_version.
import type { Db } from './connection';

const migrations: ((db: Db) => Promise<void>)[] = [
  async (db) => {
    await db.execAsync(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL,
        starts_at TEXT NOT NULL, location_label TEXT, latitude REAL, longitude REAL,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE INDEX idx_events_starts_at ON events(starts_at);
      CREATE TABLE participations (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL, PRIMARY KEY (user_id, event_id));
      CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    `);
  },
];

export const SCHEMA_VERSION = migrations.length;

export async function migrate(db: Db): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let version = current; version < SCHEMA_VERSION; version++) {
    // Une migration et son numéro de version passent ensemble ou pas du tout.
    await db.withTransactionAsync(async () => {
      await migrations[version](db);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
