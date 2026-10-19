// Accès à la table settings (clé/valeur).
import type { Db } from '@/db/connection';

export type SettingKey = 'session_user_id' | 'seeded_at';

export const settingsRepo = {
  async get(db: Db, key: SettingKey): Promise<string | null> {
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
    return row?.value ?? null;
  },

  async set(db: Db, key: SettingKey, value: string): Promise<void> {
    await db.runAsync(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key,
      value,
    );
  },

  async remove(db: Db, key: SettingKey): Promise<void> {
    await db.runAsync('DELETE FROM settings WHERE key = ?', key);
  },
};
