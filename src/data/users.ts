// Accès à la table users.
import type { Db } from '@/db/connection';
import type { User } from './types';

type UserRow = { id: number; name: string; email: string; created_at: string; password_hash: string; salt: string };

const toUser = (r: UserRow): User => ({ id: r.id, name: r.name, email: r.email, createdAt: r.created_at });

export const usersRepo = {
  async create(
    db: Db,
    input: { name: string; email: string; passwordHash: string; salt: string; now: string },
  ): Promise<User> {
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO users (name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)',
      input.name,
      input.email,
      input.passwordHash,
      input.salt,
      input.now,
    );
    return { id: lastInsertRowId, name: input.name, email: input.email, createdAt: input.now };
  },

  /** Compte avec son condensat et son sel, ou `null` ; `email` doit être normalisé, la comparaison est exacte. */
  async findByEmail(db: Db, email: string): Promise<(User & { passwordHash: string; salt: string }) | null> {
    const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE email = ?', email);
    return row ? { ...toUser(row), passwordHash: row.password_hash, salt: row.salt } : null;
  },

  async findById(db: Db, id: number): Promise<User | null> {
    const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', id);
    return row ? toUser(row) : null;
  },

  async countEventsByAuthor(db: Db, userId: number): Promise<number> {
    const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM events WHERE author_id = ?', userId);
    return row?.n ?? 0;
  },
};
