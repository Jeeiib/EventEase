// Insertion du jeu de démonstration au premier lancement, et sa réinitialisation.
import type { Db } from './connection';
import { demoEvents, demoUsers, DEMO_PASSWORD } from './demoData';
import { usersRepo } from '@/data/users';
import { eventsRepo } from '@/data/events';
import { settingsRepo } from '@/data/settings';
import { addDays } from '@/utils/dates';

export type Hasher = (password: string, salt: string) => Promise<string>;

// Sans transaction propre : l'appelant en ouvre une, SQLite n'accepte pas deux BEGIN imbriqués.
async function insertDemoData(db: Db, now: Date, hash: Hasher, randomSalt: () => string): Promise<void> {
  const nowIso = now.toISOString();
  const userIds = new Map<string, number>();
  for (const u of demoUsers) {
    const salt = randomSalt();
    const user = await usersRepo.create(db, {
      name: u.name,
      email: u.email,
      passwordHash: await hash(DEMO_PASSWORD, salt),
      salt,
      now: nowIso,
    });
    userIds.set(u.email, user.id);
  }

  const idOf = (email: string): number => {
    const id = userIds.get(email);
    if (id === undefined) throw new Error(`Compte de démo inconnu : ${email}`);
    return id;
  };

  for (const e of demoEvents) {
    // Jour et heure en local (le changement d'heure du 25/10 décale l'UTC), puis stockage en UTC.
    const day = addDays(now, e.dayOffset);
    const startsAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), e.hour, e.minute).toISOString();
    const eventId = await eventsRepo.create(
      db,
      idOf(e.authorEmail),
      { title: e.title, description: e.description, startsAt, location: e.location },
      nowIso,
    );
    for (const email of e.participantEmails) {
      await db.runAsync(
        'INSERT INTO participations (user_id, event_id, created_at) VALUES (?, ?, ?)',
        idOf(email),
        eventId,
        nowIso,
      );
    }
  }
  await settingsRepo.set(db, 'seeded_at', nowIso);
}

// Le drapeau seeded_at évite de réinsérer la démo après qu'un utilisateur a supprimé ses données.
export async function seedIfEmpty(db: Db, now: Date, hash: Hasher, randomSalt: () => string): Promise<boolean> {
  let inserted = false;
  await db.withTransactionAsync(async () => {
    if ((await settingsRepo.get(db, 'seeded_at')) !== null) return;
    await insertDemoData(db, now, hash, randomSalt);
    inserted = true;
  });
  return inserted;
}

export async function resetDemoData(db: Db, now: Date, hash: Hasher, randomSalt: () => string): Promise<void> {
  await db.withTransactionAsync(async () => {
    // Enfants d'abord ; settings aussi, ce qui efface la session en cours.
    for (const table of ['participations', 'events', 'users', 'settings']) {
      await db.runAsync(`DELETE FROM ${table}`);
    }
    await insertDemoData(db, now, hash, randomSalt);
  });
}
