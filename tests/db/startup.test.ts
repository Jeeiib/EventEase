// Préparation de la base au lancement : une seule à la fois, et un échec se réessaie.
import type { Db } from '@/db/connection';
import { createTestDb } from '../helpers/testDb';

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(async (_algo: string, text: string) => `hash:${text}`),
  getRandomBytes: jest.fn((n: number) => new Uint8Array(n)),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));
jest.mock('@/db/connection', () => ({ openDatabase: jest.fn() }));

// Chaque test repart d'un module neuf : la préparation mémorisée ne fuit pas d'un test à l'autre.
/* eslint-disable @typescript-eslint/no-require-imports -- isolateModules impose require() */
function load(): { prepareDatabase: () => Promise<Db>; open: jest.Mock } {
  let loaded!: { prepareDatabase: () => Promise<Db>; open: jest.Mock };
  jest.isolateModules(() => {
    loaded = {
      prepareDatabase: require('@/db/startup').prepareDatabase,
      open: require('@/db/connection').openDatabase,
    };
  });
  return loaded;
}

it("n'ouvre la base qu'une fois quand on l'appelle deux fois", async () => {
  const { prepareDatabase, open } = load();
  open.mockResolvedValue(createTestDb());
  const [a, b] = await Promise.all([prepareDatabase(), prepareDatabase()]);
  expect(a).toBe(b);
  expect(open).toHaveBeenCalledTimes(1);
});

it('réessaie vraiment après un échec', async () => {
  const { prepareDatabase, open } = load();
  open.mockRejectedValueOnce(new Error('disque plein')).mockResolvedValue(createTestDb());
  await expect(prepareDatabase()).rejects.toThrow('disque plein');
  const db = await prepareDatabase();
  expect(open).toHaveBeenCalledTimes(2);
  expect(await db.getFirstAsync('SELECT COUNT(*) AS n FROM users')).toEqual({ n: 4 });
});
