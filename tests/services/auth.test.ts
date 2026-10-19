// Service d'authentification : hachage salé, inscription, connexion, sel aléatoire.
import { createHash, randomBytes } from 'node:crypto';
import { createTestDb } from '../helpers/testDb';
import { migrate } from '@/db/migrations';
import type { Db } from '@/db/connection';
import { seedIfEmpty } from '@/db/seed';
import { DEMO_PASSWORD } from '@/db/demoData';
import { hashPassword, login, makeSalt, register, type Digest } from '@/services/auth';

// Le module natif n'existe pas sous Node : on le remplace par node:crypto.
jest.mock('expo-crypto', () => ({
  getRandomBytes: (n: number) => new Uint8Array(jest.requireActual('node:crypto').randomBytes(n)),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));

const nodeDigest: Digest = async (text) => createHash('sha256').update(text).digest('hex');
const fakeDigest: Digest = async (text) => `h(${text})`;
const now = new Date(2026, 9, 19, 12, 0);

let db: Db;
beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
});

describe('hashPassword', () => {
  it('hache le sel concaténé au mot de passe', async () => {
    expect(await hashPassword('secret', 'abc', fakeDigest)).toBe(await fakeDigest('abcsecret'));
  });
});

describe('makeSalt', () => {
  it('renvoie 32 caractères hexadécimaux, différents à chaque appel', () => {
    const a = makeSalt();
    const b = makeSalt();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toBe(b);
  });
});

describe('register et login', () => {
  const input = { name: 'Marie', email: 'marie@exemple.fr', password: 'motdepasse1' };

  it('connecte après une inscription', async () => {
    const reg = await register(db, input, { digest: fakeDigest, now });
    expect(reg.ok).toBe(true);
    const res = await login(db, { email: input.email, password: input.password }, { digest: fakeDigest });
    expect(res.ok && res.user.email).toBe('marie@exemple.fr');
  });

  it('ne renvoie jamais le hash ni le sel', async () => {
    const reg = await register(db, input, { digest: fakeDigest, now });
    const res = await login(db, { email: input.email, password: input.password }, { digest: fakeDigest });
    for (const result of [reg, res]) {
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('salt');
    }
  });

  it('refuse deux inscriptions avec le même e-mail, même écrit autrement', async () => {
    await register(db, input, { digest: fakeDigest, now });
    const again = await register(db, { ...input, email: ' MARIE@Exemple.fr ' }, { digest: fakeDigest, now });
    expect(again).toEqual({ ok: false, error: 'emailTaken' });
  });

  it("normalise l'e-mail à la connexion", async () => {
    await register(db, input, { digest: fakeDigest, now });
    const res = await login(db, { email: ' MARIE@Exemple.fr ', password: input.password }, { digest: fakeDigest });
    expect(res.ok).toBe(true);
  });

  it('renvoie le même code pour un mauvais mot de passe et un e-mail inconnu', async () => {
    await register(db, input, { digest: fakeDigest, now });
    const wrongPassword = await login(db, { email: input.email, password: 'autre' }, { digest: fakeDigest });
    const unknown = await login(db, { email: 'inconnu@exemple.fr', password: input.password }, { digest: fakeDigest });
    expect(wrongPassword).toEqual({ ok: false, error: 'invalidCredentials' });
    expect(unknown).toEqual(wrongPassword);
  });

  it('stocke un sel propre à chaque compte et pas le mot de passe en clair', async () => {
    await register(db, input, { digest: nodeDigest, now });
    await register(db, { ...input, email: 'luc@exemple.fr' }, { digest: nodeDigest, now });
    const rows = await db.getAllAsync<{ salt: string; password_hash: string }>('SELECT salt, password_hash FROM users');
    expect(rows[0].salt).not.toBe(rows[1].salt);
    expect(rows[0].password_hash).not.toBe(rows[1].password_hash);
    expect(rows[0].password_hash).not.toContain(input.password);
  });
});

describe('comptes de démonstration', () => {
  it('permet de se connecter avec le mot de passe de démo', async () => {
    const hash = (p: string, s: string) => hashPassword(p, s, nodeDigest);
    await seedIfEmpty(db, now, hash, () => randomBytes(16).toString('hex'));

    const ok = await login(db, { email: 'marie.lefevre@exemple.fr', password: DEMO_PASSWORD }, { digest: nodeDigest });
    expect(ok.ok && ok.user.name).toBe('Marie Lefèvre');

    const bad = await login(db, { email: 'marie.lefevre@exemple.fr', password: 'mauvais' }, { digest: nodeDigest });
    expect(bad).toEqual({ ok: false, error: 'invalidCredentials' });
  });
});
