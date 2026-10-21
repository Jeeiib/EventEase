// Préparation de la base au lancement : ouverture, migrations, jeu de démo au premier lancement.
import { openDatabase, type Db } from './connection';
import { migrate } from './migrations';
import { resetDemoData, seedIfEmpty } from './seed';
import { hashWithSha256, makeSalt } from '@/services/auth';

let pending: Promise<Db> | null = null;

// Une seule préparation par lancement, même si l'effet qui l'appelle est rejoué en développement.
export function prepareDatabase(): Promise<Db> {
  pending ??= (async () => {
    const db = await openDatabase();
    await migrate(db);
    await seedIfEmpty(db, new Date(), hashWithSha256, makeSalt);
    return db;
  })().catch((error: unknown) => {
    // Un échec n'est pas mémorisé : « Réessayer » relance une vraie préparation.
    pending = null;
    throw error;
  });
  return pending;
}

// Remet la base dans l'état du premier lancement, avec le hachage de production.
export function resetDemo(db: Db): Promise<void> {
  return resetDemoData(db, new Date(), hashWithSha256, makeSalt);
}
