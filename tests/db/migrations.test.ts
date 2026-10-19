import { createTestDb } from '../helpers/testDb';
import { migrate, SCHEMA_VERSION } from '@/db/migrations';
import type { Db } from '@/db/connection';

const version = async (db: Db) =>
  (await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version'))?.user_version;

const tables = async (db: Db) =>
  (
    await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
  ).map((r) => r.name);

describe('migrate', () => {
  it('crée le schéma et pose user_version', async () => {
    const db = createTestDb();
    await migrate(db);
    expect(await version(db)).toBe(SCHEMA_VERSION);
    expect(await tables(db)).toEqual(['events', 'participations', 'settings', 'users']);
  });

  it('est idempotente', async () => {
    const db = createTestDb();
    await migrate(db);
    await db.runAsync(
      "INSERT INTO users (name, email, password_hash, salt, created_at) VALUES ('A', 'a@b.fr', 'h', 's', 'now')",
    );
    await expect(migrate(db)).resolves.toBeUndefined();
    expect(await version(db)).toBe(SCHEMA_VERSION);
    expect(await db.getAllAsync('SELECT id FROM users')).toHaveLength(1);
  });

  it('rejette un événement dont l auteur n existe pas (clés étrangères actives)', async () => {
    const db = createTestDb();
    await migrate(db);
    await expect(
      db.runAsync(
        "INSERT INTO events (title, description, starts_at, author_id, created_at, updated_at) VALUES ('t', 'd', 'x', 999, 'n', 'n')",
      ),
    ).rejects.toThrow();
  });

  it('annule la transaction quand la tâche rejette', async () => {
    const db = createTestDb();
    await migrate(db);
    await expect(
      db.withTransactionAsync(async () => {
        await db.runAsync("INSERT INTO settings (key, value) VALUES ('k', 'v')");
        throw new Error('échec');
      }),
    ).rejects.toThrow('échec');
    expect(await db.getAllAsync('SELECT key FROM settings')).toHaveLength(0);
  });
});
