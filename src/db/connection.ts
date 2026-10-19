// Ouverture de la base SQLite et interface Db, seule dépendance de la couche data.
import { openDatabaseAsync } from 'expo-sqlite';

export type SqlValue = string | number | null;

/** Seule dépendance de la couche data envers SQLite : `expo-sqlite` en production, `node:sqlite` en test. */
export interface Db {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: SqlValue[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T>(sql: string, ...params: SqlValue[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, ...params: SqlValue[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

/** Ouvre `eventease.db` avec clés étrangères et journal WAL activés. */
export async function openDatabase(): Promise<Db> {
  const database = await openDatabaseAsync('eventease.db');
  // Réglage par connexion : les clés étrangères ne sont pas persistées dans le fichier.
  await database.execAsync('PRAGMA foreign_keys = ON');
  await database.execAsync('PRAGMA journal_mode = WAL');
  // Échoue à la compilation si SQLiteDatabase cesse de satisfaire Db.
  const db: Db = database;
  return db;
}
