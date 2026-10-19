// Réglages clé/valeur : lecture, écrasement, suppression.
import { createTestDb } from '../helpers/testDb';
import { migrate } from '@/db/migrations';
import type { Db } from '@/db/connection';
import { settingsRepo } from '@/data/settings';

let db: Db;
beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
});

describe('settingsRepo', () => {
  it('get renvoie null, set écrit, set écrase, remove efface', async () => {
    expect(await settingsRepo.get(db, 'session_user_id')).toBeNull();
    await settingsRepo.set(db, 'session_user_id', '3');
    expect(await settingsRepo.get(db, 'session_user_id')).toBe('3');
    await settingsRepo.set(db, 'session_user_id', '4');
    expect(await settingsRepo.get(db, 'session_user_id')).toBe('4');
    await settingsRepo.remove(db, 'session_user_id');
    expect(await settingsRepo.get(db, 'session_user_id')).toBeNull();
  });

  it('garde les clés indépendantes', async () => {
    await settingsRepo.set(db, 'seeded_at', 'x');
    await settingsRepo.remove(db, 'session_user_id');
    expect(await settingsRepo.get(db, 'seeded_at')).toBe('x');
  });
});
