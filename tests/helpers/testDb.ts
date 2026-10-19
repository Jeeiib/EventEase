// Base SQLite en mémoire (node:sqlite) qui expose la même interface Db que expo-sqlite.
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { Db, SqlValue } from '@/db/connection';

export function createTestDb(): Db {
  const raw = new DatabaseSync(':memory:');
  // expo-sqlite ouvre les connexions avec les clés étrangères actives via openDatabase().
  raw.exec('PRAGMA foreign_keys = ON');

  const bind = (params: SqlValue[]): SQLInputValue[] => params;

  return {
    async execAsync(sql) {
      raw.exec(sql);
    },
    async runAsync(sql, ...params) {
      const r = raw.prepare(sql).run(...bind(params));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getAllAsync<T>(sql: string, ...params: SqlValue[]) {
      return raw.prepare(sql).all(...bind(params)) as T[];
    },
    async getFirstAsync<T>(sql: string, ...params: SqlValue[]) {
      return (raw.prepare(sql).get(...bind(params)) as T | undefined) ?? null;
    },
    async withTransactionAsync(task) {
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };
}
