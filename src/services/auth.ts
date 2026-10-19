// Inscription et connexion : mot de passe salé puis haché, jamais stocké en clair.
import * as Crypto from 'expo-crypto';
import type { Db } from '@/db/connection';
import type { User } from '@/data/types';
import { usersRepo } from '@/data/users';
import { normalizeEmail } from '@/utils/validation';

export type Digest = (text: string) => Promise<string>;

export type RegisterError = 'emailTaken';
export type LoginError = 'invalidCredentials';

// Digest de production ; les tests injectent une version Node.
export const sha256: Digest = (text) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);

export function hashPassword(password: string, salt: string, digest: Digest): Promise<string> {
  return digest(salt + password);
}

export function makeSalt(): string {
  return Array.from(Crypto.getRandomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function register(
  db: Db,
  input: { name: string; email: string; password: string },
  deps: { digest: Digest; now: Date },
): Promise<{ ok: true; user: User } | { ok: false; error: RegisterError }> {
  const email = normalizeEmail(input.email);
  if (await usersRepo.findByEmail(db, email)) return { ok: false, error: 'emailTaken' };
  const salt = makeSalt();
  const user = await usersRepo.create(db, {
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password, salt, deps.digest),
    salt,
    now: deps.now.toISOString(),
  });
  return { ok: true, user };
}

export async function login(
  db: Db,
  input: { email: string; password: string },
  deps: { digest: Digest },
): Promise<{ ok: true; user: User } | { ok: false; error: LoginError }> {
  const found = await usersRepo.findByEmail(db, normalizeEmail(input.email));
  // Même code pour un e-mail inconnu et un mauvais mot de passe : on ne révèle pas quels comptes existent.
  if (!found) return { ok: false, error: 'invalidCredentials' };
  const hash = await hashPassword(input.password, found.salt, deps.digest);
  if (hash !== found.passwordHash) return { ok: false, error: 'invalidCredentials' };
  const { passwordHash: _hash, salt: _salt, ...user } = found;
  return { ok: true, user };
}
