// Préparation de la base au lancement : ouverture, migrations, jeu de démo au premier lancement.
import { openDatabase, type Db } from './connection';
import { migrate } from './migrations';
import { seedIfEmpty } from './seed';
import { hashPassword, makeSalt, sha256 } from '@/services/auth';

let pending: Promise<Db> | null = null;

// Une seule préparation par lancement, même si l'effet qui l'appelle est rejoué en développement.
export function prepareDatabase(): Promise<Db> {
  pending ??= (async () => {
    const db = await openDatabase();
    await migrate(db);
    await seedIfEmpty(db, new Date(), (password, salt) => hashPassword(password, salt, sha256), makeSalt);
    return db;
  })();
  return pending;
}
